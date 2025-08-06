package com.dtidigital.drone_delivery.enums;

public enum EstadoDrone {
    IDLE,
    CARREGANDO,
    EM_VOO,
    ENTREGANDO,
    RETORNANDO,
    CHARGING, // Estado específico para recarga de bateria
    MAINTENANCE // Estado para manutenção (opcional)
}