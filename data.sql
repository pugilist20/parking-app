INSERT INTO tariffs (name, price_per_hour)
VALUES
    ('Базовый', 100.00),     
    ('Средний', 150.00),     
    ('Премиум', 250.00);     

INSERT INTO zones (name, tariff_id)
VALUES
    ('Центральная', 1),      
    ('Восточная',   2),      
    ('Западная',    3),      
    ('Северная',    1),      
    ('Южная',      2);

INSERT INTO parking_slots (zone_id, slot_number, status)
VALUES
    (1, 1, 'free'),
    (1, 2, 'free'),
    (1, 3, 'free'),
    (1, 4, 'occupied'),
    (1, 5, 'occupied'),

    (2, 6, 'occupied'),
    (2, 7, 'occupied'),
    (2, 8, 'free'),

    (3, 9,  'occupied'),
    (3, 10, 'free'),
    (3, 11, 'free'),
    (3, 12, 'occupied'),

    (4, 13, 'free'),
    (4, 14, 'free'),

    (5, 15, 'free'),
    (5, 16, 'free'),
    (5, 17, 'free');

INSERT INTO cars (
    user_id,
    parking_slot_id,
    entry_time,
    exit_time,
    license_plate,
    model,
    "createdAt"
)
VALUES
    (4, 4,
     '2025-06-01 08:30:00',
     '2025-06-01 12:45:00',
     'А123ВС77',
     'Lada Granta',
     NOW()
    ),

    (5, 5,
     '2025-06-01 09:15:00',
     '2025-06-01 18:00:00',
     'В456СУ99',
     'Kia Rio',
     NOW()
    ),

    (6, 7,
     '2025-06-02 10:00:00',
     '2025-06-02 15:30:00',
     'Е789РН77',
     'Toyota Camry',
     NOW()
    ),

    (2, 6,
     '2025-06-03 07:00:00',
     NULL,
     'С012ЕК77',
     'Hyundai Solaris',
     NOW()
    ),

    (4, 9,
     '2025-05-28 14:00:00',
     '2025-05-28 16:15:00',
     'К345РМ99',
     'Renault Logan',
     NOW()
    ),

    (5, 12,
     '2025-05-29 18:45:00',
     '2025-05-30 01:20:00',
     'О678ММ77',
     'Volkswagen Polo',
     NOW()
    );
;

INSERT INTO bookings (user_id, parking_slot_id, start_time, end_time, status)
VALUES
    (4, 1, '2025-06-04 08:00:00', '2025-06-04 10:00:00', 'approved'),
    (4, 2, '2025-06-05 09:00:00', '2025-06-05 11:30:00', 'rejected'),

    (5, 7, '2025-06-02 10:00:00', '2025-06-02 15:30:00', 'approved'),

    (6, 9, '2025-05-28 14:00:00', '2025-05-28 16:15:00', 'approved'),

    (3, 12, '2025-05-29 18:45:00', '2025-05-30 01:20:00', 'approved'),

    (5, 1, '2025-06-06 12:00:00', '2025-06-06 14:30:00', 'approved'),
    (6, 2, '2025-06-06 15:00:00', '2025-06-06 17:00:00', 'approved');