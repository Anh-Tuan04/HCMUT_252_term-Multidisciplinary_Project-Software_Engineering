package parking_lot

import "github.com/gin-gonic/gin"

func RegisterRoutes(api *gin.RouterGroup, handler *Handler) {
	group := api.Group("/parking-lots")
	{
		group.POST("", handler.Create)
		group.GET("", handler.FindAll)
		group.GET("/:id", handler.FindByID)
		group.PATCH("/:id", handler.Update)
	}
}
