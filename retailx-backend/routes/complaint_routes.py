from flask import Blueprint, request, jsonify
from models.complaint import Complaint
from flask_jwt_extended import jwt_required, get_jwt_identity

# User side blueprint
complaint_bp = Blueprint('complaint_bp', __name__)

# ---------------------------------------------------------
# 1. ROUTE: Submit a New Complaint
# ---------------------------------------------------------
@complaint_bp.route('/api/support/submit', methods=['POST'])
@jwt_required()
def submit_ticket():
    try:
        data = request.get_json()
        user_id = get_jwt_identity() # Extracting user ID from JWT token

        # Validation
        if not data.get('issueType') or not data.get('message'):
            return jsonify({"error": "Issue type and message are required fields."}), 400

        # Calling the static method from Complaint model
        result = Complaint.create_complaint(
            user_id=user_id,
            order_id=data.get('orderId', 'N/A'),
            issue_type=data.get('issueType'),
            message=data.get('message')
        )

        return jsonify({
            "message": "Complaint registered successfully!",
            "id": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# 2. ROUTE: Fetch User's Personal Complaints
# ---------------------------------------------------------
@complaint_bp.route('/api/user/my-complaints', methods=['GET'])
@jwt_required()
def get_user_complaints():
    try:
        user_id = get_jwt_identity()
        # Fetch user-specific data from MongoDB via Model
        user_tickets = Complaint.get_by_user(user_id)
        
        return jsonify(user_tickets), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500