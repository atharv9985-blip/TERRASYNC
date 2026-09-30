ALTER TABLE grievances
ADD COLUMN case_id BIGINT;

UPDATE grievances
SET case_id = acquisition_case_id
WHERE case_id IS NULL;

ALTER TABLE grievances
ADD CONSTRAINT fk_grievances_case
FOREIGN KEY (case_id)
REFERENCES acquisition_cases(id);