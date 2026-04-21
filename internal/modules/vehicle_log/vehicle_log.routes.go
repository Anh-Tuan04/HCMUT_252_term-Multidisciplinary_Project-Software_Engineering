package vehicle_log

import "github.com/gin-gonic/gin"

func RegisterRoutes(api *gin.RouterGroup, handler *Handler, authMiddleware, managerOrAdmin gin.HandlerFunc) {
	group := api.Group("/vehicle-log")
	group.Use(authMiddleware)
	{
		group.GET("/:slotId", managerOrAdmin, handler.GetLogsBySlotID)
	}
}
