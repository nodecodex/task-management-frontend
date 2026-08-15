import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Modal, ModalBody, Col, Spinner } from "reactstrap";
import { Icon, Button } from "@/components/Component";
import { useForm } from "react-hook-form";
import { ColorOptions } from "@/components/partials/color-select-menu/ColorMenu";
import { useTaskContext } from "@/layout/provider/TaskContext";
import { THEME_OPTIONS } from "@/utils/constants";
import { toast } from "react-toastify";

const BoardForm = ({ toggle, isOpen, edit, board }) => {
  const { createBoard, updateBoard } = useTaskContext();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0]);

  useEffect(() => {
    if (edit && board) {
      setValue("title", board.title || "");
      const matchedTheme = THEME_OPTIONS.find((t) => t.value === board.theme) || THEME_OPTIONS[0];
      setSelectedTheme(matchedTheme);
    } else {
      reset({ title: "" });
      setSelectedTheme(THEME_OPTIONS[0]);
    }
  }, [edit, board, isOpen, reset, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (edit && board?.id) {
        await updateBoard(board.id, {
          title: data.title.trim(),
          theme: selectedTheme.value,
        });
        toast.success("Board updated successfully");
      } else {
        await createBoard({
          title: data.title.trim(),
          theme: selectedTheme.value,
        });
        toast.success("Board created successfully");
      }
      toggle(false);
    } catch (err) {
      toast.error(err.message || "Failed to save board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={() => toggle(false)}>
      <ModalBody>
        <a
          href="#cancel"
          className="close"
          onClick={(ev) => {
            ev.preventDefault();
            toggle(false);
          }}
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">{edit ? "Update" : "Add"} Board</h5>
          <div className="mt-4">
            <form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col className="col-12">
                <div className="form-group">
                  <label className="form-label">Board Title</label>
                  <input
                    type="text"
                    {...register('title', { required: "Board title is required" })}
                    placeholder="Enter board title"
                    className="form-control"
                  />
                  {errors.title && <span className="invalid">{errors.title.message}</span>}
                </div>
              </Col>
              <Col className="col-12">
                <div className="form-group">
                  <label className="form-label">Select Theme / Color</label>
                  <div className="form-control-select">
                    <Select
                      className="react-select-container"
                      classNamePrefix="react-select"
                      formatOptionLabel={ColorOptions}
                      value={selectedTheme}
                      options={THEME_OPTIONS}
                      onChange={(option) => setSelectedTheme(option)}
                    />
                  </div>
                </div>
              </Col>
              <Col className="col-12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit" disabled={loading}>
                      {loading ? <Spinner size="sm" color="light" /> : `${edit ? "Update" : "Add"} Board`}
                    </Button>
                  </li>
                  <li>
                    <Button
                      className="link link-light"
                      onClick={(ev) => {
                        ev.preventDefault();
                        toggle(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </li>
                </ul>
              </Col>
            </form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default BoardForm;