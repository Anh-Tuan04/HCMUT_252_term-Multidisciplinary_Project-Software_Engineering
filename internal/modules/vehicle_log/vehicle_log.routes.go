package vehicle_log

import "github.com/gin-gonic/gin"

func RegisterRoutes(api *gin.RouterGroup, handler *Handler) {
	group := api.Group("/vehicle-log")
	{
		group.GET("/:slotId", handler.GetLogsBySlotID)
	}
}
