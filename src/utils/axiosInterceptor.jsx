import axios from 'axios' // Import axios to create an isolated client instance.

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1` // Build the base API url with a fallback.

const instance = axios.create({ // Create a dedicated axios instance for the app.
	baseURL: API_BASE_URL, // Set the base URL so callers can use relative paths.
	timeout: 15000, // Abort requests that take too long to respond.
}) // End axios instance creation.

let accessToken = null // Hold the in-memory access token used by the interceptor.

export const setAccessToken = (token) => { // Provide a setter so other modules can update the token.
	accessToken = token // Store the token in module scope without touching storage.
} // End setAccessToken.

export const getAccessToken = () => { // Provide a getter for diagnostic or custom usage.
	return accessToken // Return the current in-memory token value.
} // End getAccessToken.

let isRefreshing = false // Track whether a refresh call is already in progress.
let refreshSubscribers = [] // Queue callbacks that wait for a refreshed token.

const AUTH_LANDING_PATH = '/' // Centralize the AuthLanding route path.
const AUTH_NOTICE_KEY = 'auth_landing_notice' // Storage key for notice messages.

const setAuthLandingNotice = (message) => { // Store a notice so AuthLanding can read it later.
	sessionStorage.setItem(AUTH_NOTICE_KEY, message) // Persist the notice for the next navigation.
} // End setAuthLandingNotice.

const redirectToAuthLanding = (message) => { // Redirect to AuthLanding with a stored notice.
	if (message) { // Only store a message when provided.
		setAuthLandingNotice(message) // Save the notice for AuthLanding to read.
	} // End optional notice store.
	window.location.assign(AUTH_LANDING_PATH) // Force navigation back to AuthLanding.
} // End redirectToAuthLanding.

const onRefreshed = (newAccessToken) => { // Notify all queued requests with the new token.
	refreshSubscribers.forEach((callback) => callback(null, newAccessToken)) // Replay each queued callback with success.
	refreshSubscribers = [] // Clear the queue after notifying.
} // End onRefreshed.

const onRefreshFailed = (error) => { // Notify all queued requests that refresh failed.
	refreshSubscribers.forEach((callback) => callback(error, null)) // Replay each queued callback with error.
	refreshSubscribers = [] // Clear the queue after notifying.
} // End onRefreshFailed.

const addRefreshSubscriber = (callback) => { // Add a callback to the refresh queue.
	refreshSubscribers.push(callback) // Enqueue the callback for later execution.
} // End addRefreshSubscriber.

instance.interceptors.request.use( // Register a request interceptor to attach auth headers.
	(config) => { // Handle successful request configuration.
		if (accessToken) { // Only attach the header when a token exists.
			config.headers = config.headers ?? {} // Ensure headers object is initialized.
			config.headers.Authorization = `Bearer ${accessToken}` // Attach the bearer token.
		} // End token header setup.
		return config // Continue the request pipeline.
	}, // End request success handler.
	(error) => { // Handle request configuration errors.
		return Promise.reject(error) // Forward the error to the caller.
	}, // End request error handler.
) // End request interceptor registration.

instance.interceptors.response.use( // Register a response interceptor for refresh logic.
	(response) => { // Handle successful responses.
		return response // Pass through successful responses.
	}, // End response success handler.
	async (error) => { // Handle failed responses, including 401 refresh flow.
		const originalRequest = error.config ?? {} // Capture the original request config.
		const status = error.response?.status // Read the HTTP status if present.
		const requestUrl = String(originalRequest.url ?? '') // Normalize the original URL string.
		const isTimeout = error.code === 'ECONNABORTED' // Detect axios timeout errors.

		if (!error.response) { // If no response exists, this is a network error.
			if (isTimeout) { // Handle requests that exceed the timeout threshold.
				redirectToAuthLanding('Server phản hồi quá lâu, vui lòng thử lại sau.') // Redirect with a timeout notice.
			} // End timeout handling.
			return Promise.reject(error) // Reject the promise so the caller can handle it.
		} // End network error check.

		if (isTimeout) { // Handle timeout even when a response object exists.
			redirectToAuthLanding('Server phản hồi quá lâu, vui lòng thử lại sau.') // Redirect with a timeout notice.
			return Promise.reject(error) // Stop further processing for timeout cases.
		} // End timeout-with-response handling.

		if ( // Start refresh-token guard condition.
			status === 401 && // Trigger only on unauthorized responses.
			!originalRequest._retry && // Prevent infinite retry loops.
			!requestUrl.includes('/auth/refresh-token') // Avoid refreshing the refresh endpoint.
		) { // End refresh-token guard condition.
			originalRequest._retry = true // Mark this request as retried.

			if (isRefreshing) { // If a refresh request is already running.
				return new Promise((resolve, reject) => { // Return a promise resolved or rejected after refresh completes.
					addRefreshSubscriber((refreshError, newAccessToken) => { // Subscribe this request to refresh completion.
						if (refreshError) { // Reject when refresh fails.
							reject(refreshError) // Bubble the refresh error to the caller.
							return // Stop processing this subscriber.
						} // End refresh error check.
						originalRequest.headers = originalRequest.headers ?? {} // Ensure headers object exists.
						originalRequest.headers.Authorization = `Bearer ${newAccessToken}` // Update auth header.
						resolve(instance(originalRequest)) // Retry the original request with new token.
					}) // End refresh subscriber callback.
				}) // End queued promise.
			} // End isRefreshing branch.

			isRefreshing = true // Lock refresh to a single in-flight request.

			try { // Begin refresh attempt.
				const refreshResponse = await axios.post( // Call refresh token endpoint.
					`${API_BASE_URL}/auth/refresh-token`, // Target refresh endpoint.
					null, // No body required by the refresh API.
					{ withCredentials: true, timeout: 15000 }, // Send cookies with a timeout to avoid hanging.
				) // End refresh call.

				const newAccessToken = refreshResponse?.data?.data?.access_token // Extract access token from response.

				if (!newAccessToken) { // Validate that the refresh response contains a token.
					throw new Error('Invalid refresh response') // Throw to trigger outer catch.
				} // End token presence check.

				accessToken = newAccessToken // Update in-memory access token for subsequent requests.
				onRefreshed(newAccessToken) // Notify queued requests with the new token.
				originalRequest.headers = originalRequest.headers ?? {} // Ensure headers object exists.
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}` // Attach new token to retry.
				return instance(originalRequest) // Retry the original request using the instance.
			} catch (refreshError) { // Handle refresh failure or expired refresh token.
				onRefreshFailed(refreshError) // Reject all queued requests waiting for refresh.
				redirectToAuthLanding('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.') // Redirect with refresh-expired notice.
				return Promise.reject(refreshError) // Propagate the refresh error to the caller.
			} finally { // Always run cleanup after refresh attempt.
				isRefreshing = false // Release the refresh lock for future 401s.
			} // End refresh try/finally.
		} // End 401 refresh handling.

		if (status === 401 || status === 403) { // Handle forbidden or unauthorized after refresh logic.
			redirectToAuthLanding('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.') // Redirect with session-expired notice.
			return Promise.reject(error) // Stop the chain after redirect.
		} // End auth failure handling.

		return Promise.reject(error) // Propagate other errors to the caller.
	}, // End response error handler.
) // End response interceptor registration.

export default instance // Export the configured axios instance.
