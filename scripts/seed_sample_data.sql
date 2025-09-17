-- Sample data for testing the Document Verification System

-- Insert sample users
INSERT INTO users (name, email, phone) VALUES
('John Doe', 'john.doe@example.com', '+91-9876543210'),
('Jane Smith', 'jane.smith@example.com', '+91-9876543211'),
('Mike Johnson', 'mike.johnson@example.com', '+91-9876543212')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (user_id, number_plate, vehicle_type, make, model, year, engine_capacity) VALUES
(1, 'MH12AB1234', 'Motorcycle', 'Honda', 'CB Shine', 2020, '125cc'),
(2, 'MH14CD5678', 'Motorcycle', 'Bajaj', 'Pulsar', 2019, '150cc'),
(3, 'MH01EF9012', 'Car', 'Maruti', 'Swift', 2021, '1200cc')
ON CONFLICT (number_plate) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (user_id, vehicle_id, document_type, document_number, issue_date, expiry_date, issuing_authority, status) VALUES
-- John Doe's documents
(1, 1, 'driving_license', 'MH1220160001234', '2016-12-15', '2026-12-15', 'RTO Mumbai', 'valid'),
(1, 1, 'registration', 'MH12AB1234RC', '2020-08-20', '2025-08-20', 'RTO Mumbai', 'valid'),
(1, 1, 'insurance', 'INS2023001234', '2023-03-10', '2024-03-10', 'HDFC ERGO', 'expired'),
(1, 1, 'pollution', 'PUC2024001234', '2024-06-30', '2024-12-30', 'Authorized Center', 'valid'),

-- Jane Smith's documents
(2, 2, 'driving_license', 'MH1420180005678', '2018-05-20', '2028-05-20', 'RTO Pune', 'valid'),
(2, 2, 'registration', 'MH14CD5678RC', '2019-11-15', '2024-11-15', 'RTO Pune', 'valid'),
(2, 2, 'insurance', 'INS2024005678', '2024-01-15', '2025-01-15', 'ICICI Lombard', 'valid'),
(2, 2, 'pollution', 'PUC2024005678', '2024-08-15', '2025-02-15', 'Authorized Center', 'valid'),

-- Mike Johnson's documents
(3, 3, 'driving_license', 'MH0120190009012', '2019-03-10', '2029-03-10', 'RTO Mumbai', 'valid'),
(3, 3, 'registration', 'MH01EF9012RC', '2021-07-25', '2026-07-25', 'RTO Mumbai', 'valid'),
(3, 3, 'insurance', 'INS2024009012', '2024-02-20', '2025-02-20', 'Bajaj Allianz', 'valid'),
(3, 3, 'pollution', 'PUC2024009012', '2024-09-10', '2025-03-10', 'Authorized Center', 'valid');

-- Insert sample QR codes
INSERT INTO qr_codes (user_id, qr_data, expires_at) VALUES
(1, 'eyJyaWRlcklkIjoiMSIsImRvY3VtZW50cyI6W10sImdlbmVyYXRlZEF0IjoiMjAyNC0wMS0xNVQxMDowMDowMFoiLCJleHBpcmVzQXQiOiIyMDI1LTAxLTE1VDEwOjAwOjAwWiJ9', '2025-01-15 10:00:00'),
(2, 'eyJyaWRlcklkIjoiMiIsImRvY3VtZW50cyI6W10sImdlbmVyYXRlZEF0IjoiMjAyNC0wMS0xNVQxMDowMDowMFoiLCJleHBpcmVzQXQiOiIyMDI1LTAxLTE1VDEwOjAwOjAwWiJ9', '2025-01-15 10:00:00'),
(3, 'eyJyaWRlcklkIjoiMyIsImRvY3VtZW50cyI6W10sImdlbmVyYXRlZEF0IjoiMjAyNC0wMS0xNVQxMDowMDowMFoiLCJleHBpcmVzQXQiOiIyMDI1LTAxLTE1VDEwOjAwOjAwWiJ9', '2025-01-15 10:00:00');

-- Insert sample verification logs
INSERT INTO verification_logs (user_id, verifier_type, verifier_location, verification_result, verified_at) VALUES
(1, 'fuel_station', 'Shell Petrol Pump, Bandra', '{"success": true, "documents_verified": ["registration", "driving_license"]}', '2024-01-10 14:30:00'),
(1, 'police', 'Traffic Police, Worli', '{"success": true, "violations": ["insurance_expired"], "risk_level": "medium"}', '2024-01-12 16:45:00'),
(2, 'fuel_station', 'HP Petrol Pump, Pune', '{"success": true, "documents_verified": ["registration", "driving_license"]}', '2024-01-11 11:20:00');

-- Insert sample violations
INSERT INTO violations (user_id, vehicle_id, violation_type, description, fine_amount, issued_by, due_date) VALUES
(1, 1, 'Insurance Expired', 'Vehicle insurance has expired', 2000.00, 'Traffic Police Mumbai', '2024-02-15');
