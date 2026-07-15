from db.database import get_db_manager # Use the global get_db_manager function
from decimal import Decimal
from typing import List, Dict, Any
from sqlalchemy import text

def add_petty_cash_transaction(transaction_date: str, description: str, amount: Decimal, transaction_type: str, authorized_by: str) -> int:
    """Adds a new petty cash transaction and returns its ID."""
    query = """
    INSERT INTO petty_cash (transaction_date, description, amount, transaction_type, authorized_by)
    VALUES (:transaction_date, :description, :amount, :transaction_type, :authorized_by)
    RETURNING id
    """
    try:
        new_id = get_db_manager().insert_and_return_id(query, {
            "transaction_date": transaction_date,
            "description": description,
            "amount": amount,
            "transaction_type": transaction_type,
            "authorized_by": authorized_by
        })
        return new_id
    except Exception as e:
        print(f"Error adding petty cash transaction: {e}")
        return None
def get_all_petty_cash_transactions() -> List[Dict[str, Any]]:
    """Retrieves all petty cash transactions, ordered by most recent."""
    query = "SELECT id, transaction_date, description, amount, transaction_type, authorized_by FROM petty_cash ORDER BY transaction_date DESC, id DESC"
    try:
        return get_db_manager().fetch_all(query)
    except Exception as e:
        print(f"Error getting all petty cash transactions: {e}")
        return []
def search_petty_cash(search_query: str) -> List[Dict[str, Any]]:
    """
    Searches for petty cash transactions by description, transaction type, or authorized by.
    """
    try:
        query = """
        SELECT id, transaction_date, description, amount, transaction_type, authorized_by
        FROM petty_cash
        WHERE description ILIKE :search_pattern OR transaction_type ILIKE :search_pattern OR authorized_by ILIKE :search_pattern
        ORDER BY transaction_date DESC, id DESC
        """
        search_pattern = f"%{search_query}%"
        return get_db_manager().fetch_all(query, {"search_pattern": search_pattern})
    except Exception as e:
        print(f"Error searching petty cash transactions: {e}")
        return []
def get_petty_cash_transaction_by_id(transaction_id: int) -> Dict[str, Any] | None:
    """Retrieves a single petty cash transaction by its ID."""
    query = "SELECT id, transaction_date, description, amount, transaction_type, authorized_by FROM petty_cash WHERE id = :transaction_id"
    try:
        return get_db_manager().fetch_one(query, {"transaction_id": transaction_id})
    except Exception as e:
        print(f"Error getting petty cash transaction by ID: {e}")
        return None
def get_petty_cash_balance() -> Decimal:
    """Calculates and returns the current petty cash balance."""
    try:
        total_income = get_total_income()
        total_expenses = get_total_expenses()
        return total_income - total_expenses
    except Exception as e:
        print(f"Error calculating petty cash balance: {e}")
        return Decimal('0.00')

def get_total_income() -> Decimal:
    """Calculates the total income for the petty cash fund."""
    query = "SELECT COALESCE(SUM(amount), 0) AS total_income FROM petty_cash WHERE transaction_type = 'Income'"
    try:
        result = get_db_manager().fetch_one(query)
        return Decimal(result['total_income']) if result and result['total_income'] is not None else Decimal('0.00')
    except Exception as e:
        print(f"Error getting total income: {e}")
        return Decimal('0.00')

def get_total_expenses() -> Decimal:
    """Calculates the total expenses for the petty cash fund."""
    query = "SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM petty_cash WHERE transaction_type = 'Expense'"
    try:
        result = get_db_manager().fetch_one(query)
        return Decimal(result['total_expenses']) if result and result['total_expenses'] is not None else Decimal('0.00')
    except Exception as e:
        print(f"Error getting total expenses: {e}")
        return Decimal('0.00')

def delete_petty_cash_transaction(transaction_id: int) -> bool:
    """Deletes a petty cash transaction by its ID."""
    query = "DELETE FROM petty_cash WHERE id = :transaction_id"
    try:
        get_db_manager().execute(query, {"transaction_id": transaction_id})
        return True
    except Exception as e:
        print(f"Error deleting petty cash transaction: {e}")
        return False

def update_petty_cash_transaction(transaction_id: int, transaction_date: str, description: str, amount: Decimal, transaction_type: str, authorized_by: str) -> bool:
    """Updates an existing petty cash transaction."""
    query = """
    UPDATE petty_cash
    SET transaction_date = :transaction_date, description = :description, amount = :amount, transaction_type = :transaction_type, authorized_by = :authorized_by, updated_at = CURRENT_TIMESTAMP
    WHERE id = :transaction_id
    """
    try:
        get_db_manager().execute(query, {
            "transaction_date": transaction_date,
            "description": description,
            "amount": amount,
            "transaction_type": transaction_type,
            "authorized_by": authorized_by,
            "transaction_id": transaction_id
        })
        return True
    except Exception as e:
        print(f"Error updating petty cash transaction: {e}")
        return False