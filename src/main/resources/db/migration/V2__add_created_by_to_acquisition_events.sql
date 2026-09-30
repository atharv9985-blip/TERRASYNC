ALTER TABLE acquisition_events
ADD COLUMN created_by_id BIGINT;

ALTER TABLE acquisition_events
ADD CONSTRAINT fk_acquisition_events_created_by
FOREIGN KEY (created_by_id)
REFERENCES users(id);