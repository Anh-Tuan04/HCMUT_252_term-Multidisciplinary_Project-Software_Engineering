package user

import "github.com/gin-gonic/gin"

func RegisterRoutes(api *gin.RouterGroup, handler *Handler) {
	group := api.Group("/users")
	{
		group.GET("", handler.FindWithPagination)
		group.POST("", handler.CreateByAdmin)
		group.PATCH("/change-password", handler.ChangePassword)
		group.PATCH("/change-role/:id", handler.ChangeRole)
	}
}
