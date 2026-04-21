package parking_slot

import (
	"backend/internal/modules/vehicle_log"
	"backend/internal/realtime/parking"

	"gorm.io/gorm"
)

type Module struct {
	Repository *Repository
	Service    *Service
	Handler    *Handler
}

func NewModule(db *gorm.DB, vehicleLogService *vehicle_log.Service, hub *parking.Hub) *Module {
	repo := NewRepository(db)
	service := NewService(repo, vehicleLogService, hub)
	handler := NewHandler(service)

	return &Module{
		Repository: repo,
		Service:    service,
		Handler:    handler,
	}
}
