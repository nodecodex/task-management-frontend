import React from "react";
import { Modal, ModalBody, Spinner } from "reactstrap";
import { Icon, Button } from "@/components/Component";

const DeleteConfirmationModal = ({
  isOpen,
  toggle,
  onConfirm,
  title = "Delete Task",
  taskTitle = "",
  description,
  loading = false,
  confirmButtonText = "Delete Task",
  cancelButtonText = "Cancel",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      toggle={() => !loading && toggle(false)}
      centered
      className="delete-confirm-modal"
      contentClassName="border-0 rounded-4 overflow-hidden shadow-2xl bg-white dark:bg-[#141d2b] text-slate-800 dark:text-slate-100"
    >
      <ModalBody className="p-4 p-sm-5 text-center">
        {/* Close Button */}
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          disabled={loading}
          onClick={() => toggle(false)}
          style={{ cursor: "pointer", zIndex: 10 }}
        />

        {/* Warning Icon Badge */}
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{
            width: "68px",
            height: "68px",
            backgroundColor: "rgba(232, 83, 71, 0.12)",
            color: "#e85347",
            fontSize: "2rem",
          }}
        >
          <Icon name="trash" />
        </div>

        {/* Modal Title */}
        <h4 className="fw-bold mb-2 text-slate-900 dark:text-white" style={{ fontSize: "1.25rem" }}>
          {title}
        </h4>

        {/* Modal Description */}
        <div className="text-muted small mb-4 px-2" style={{ lineHeight: "1.55", fontSize: "0.925rem" }}>
          {description ? (
            description
          ) : (
            <>
              Are you sure you want to delete{" "}
              {taskTitle ? (
                <strong className="text-slate-800 dark:text-slate-200">"{taskTitle}"</strong>
              ) : (
                "this task"
              )}
              ? This action cannot be undone.
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center align-items-center gap-3 pt-1">
          <Button
            type="button"
            color="light"
            size="lg"
            className="px-4 fw-medium text-slate-600 dark:text-slate-300"
            disabled={loading}
            onClick={() => toggle(false)}
          >
            {cancelButtonText}
          </Button>

          <Button
            type="button"
            color="danger"
            size="lg"
            className="px-4 fw-medium d-inline-flex align-items-center gap-1 shadow-sm"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? (
              <>
                <Spinner size="sm" color="light" className="me-1" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Icon name="trash" />
                <span>{confirmButtonText}</span>
              </>
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default DeleteConfirmationModal;
