package parking_session

import "github.com/gin-gonic/gin"

func RegisterRoutes(api *gin.RouterGroup, handler *Handler) {
	group := api.Group("/parking-sessions")
	{
		group.GET("", handler.FindAll)
		group.GET("/:id", handler.FindByID)
	}
}
