CREATE OR REPLACE FUNCTION GetDailyPayments(p_date DATE)
RETURNS TABLE (
    id INT,
    first_name VARCHAR,
    last_name VARCHAR,
    course_name VARCHAR,
    amount DECIMAL,
    payment_date DATE,
    payment_method VARCHAR,
    status VARCHAR,
    receipt_number VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        s.first_name,
        s.last_name,
        c.course_name,
        p.amount,
        p.payment_date,
        p.payment_method,
        p.status,
        p.receipt_number
    FROM payments p
    JOIN students s ON p.student_id = s.id
    JOIN courses c ON p.course_id = c.id
    WHERE p.payment_date = p_date
    ORDER BY p.payment_date DESC, s.first_name ASC;
END;
$$ LANGUAGE plpgsql;
