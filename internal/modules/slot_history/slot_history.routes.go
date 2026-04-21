package slot_history

import "github.com/gin-gonic/gin"

func RegisterRoutes(api *gin.RouterGroup, handler *Handler) {
	group := api.Group("/slot-histories")
	{
		group.GET("/:slotId", handler.GetBySlotID)
	}
}
