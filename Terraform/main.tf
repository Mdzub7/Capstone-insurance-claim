# --- DYNAMODB TABLE ---
resource "aws_dynamodb_table" "claims_table" {
  name         = "${var.project_name}-claims-${var.environment}"
  billing_mode = "PAY_PER_REQUEST" # Save money (Serverless model)
  hash_key     = "claim_id"

  attribute {
    name = "claim_id"
    type = "S" # String
  }
  
  # Global Secondary Index for querying by User
  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIndex"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.project_name}-dynamodb"
    Environment = var.environment
  }
}

# --- S3 BUCKET FOR DOCUMENTS ---
resource "aws_s3_bucket" "claims_docs" {
  bucket = "${var.project_name}-docs-${var.environment}-12345" # Must be globally unique
  
  # Force destroy allows deleting bucket even if files exist (Good for Dev, Bad for Prod)
  force_destroy = true 

  tags = {
    Name        = "${var.project_name}-s3"
    Environment = var.environment
  }
}

# Enable Versioning (Compliance Requirement)
resource "aws_s3_bucket_versioning" "docs_versioning" {
  bucket = aws_s3_bucket.claims_docs.id
  versioning_configuration {
    status = "Enabled"
  }
}
