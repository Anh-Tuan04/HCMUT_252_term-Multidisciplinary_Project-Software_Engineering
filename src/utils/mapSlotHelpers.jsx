export const SLOT_VISUAL_STATUS = {
	AVAILABLE: 'empty',
	OCCUPIED: 'occupied',
	MAINTAIN: 'warning',
}

export const toVisualStatus = (value) => {
	const normalized = String(value ?? '').trim().toUpperCase()
	return SLOT_VISUAL_STATUS[normalized] ?? 'empty'
}

export const createParkingSlotViews = (slots = []) => {
	return slots.map((slot, index) => {
		const portNumber = Number(slot?.port_number ?? index + 1)

		return {
			id: typeof slot?.id === 'number' ? slot.id : index + 1,
			name: typeof slot?.name === 'string' ? slot.name : `A${index + 1}`,
			orientation: portNumber <= 4 ? 'down' : 'up',
			status: toVisualStatus(slot?.status),
			// timestamp used to detect initial load vs subsequent realtime updates
			loadedAt: Date.now(),
			isUpdating: false,
		}
	})
}

export const calculateSlotStats = (slots = []) => {
	const total = slots.length
	const occupied = slots.filter((slot) => slot.status === 'occupied').length
	const warning = slots.filter((slot) => slot.status === 'warning').length
	const empty = slots.filter((slot) => slot.status === 'empty').length

	return {
		empty,
		occupied,
		warning,
		total,
		usable: Math.max(total - warning, 0),
	}
}

export const applyRealtimeSlotUpdate = (previousSlots, payload, expectedLotId) => {
	if (typeof payload?.lot_id === 'number' && payload.lot_id !== expectedLotId) {
		return previousSlots
	}

	const index = previousSlots.findIndex((slot) => {
		if (typeof payload?.id === 'number' && payload.id === slot.id) {
			return true
		}

		if (typeof payload?.name === 'string') {
			return payload.name.toUpperCase() === String(slot.name ?? '').toUpperCase()
		}

		return false
	})

	if (index < 0) {
		return previousSlots
	}

	const nextStatus = toVisualStatus(payload?.new_status)

	if (nextStatus === previousSlots[index].status) {
		return previousSlots
	}

	const next = [...previousSlots]
	next[index] = {
		...next[index],
		status: nextStatus,
	}

	return next
}
