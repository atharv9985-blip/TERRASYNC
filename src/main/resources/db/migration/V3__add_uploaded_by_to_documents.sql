ALTER TABLE documents
ADD COLUMN uploaded_by_id BIGINT;

ALTER TABLE documents
ADD CONSTRAINT fk_documents_uploaded_by
FOREIGN KEY (uploaded_by_id)
REFERENCES users(id);