import React from "react";
import { Modal } from "react-bootstrap";
import { Button, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import "./style.scss";

const WarningModal = (props) => {
  return (
    <Modal
      dialogClassName="ErrorAlert text-center"
      show={props.showModal}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          <ErrorOutlineIcon />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          overflow: "hidden",
          paddingLeft: "2px",
        }}>
        <Typography variant="subtitle1">{props.msg}</Typography>
        <Button
          type="submit"
          className="btn btn-secondary Cancel"
          variant="contained"
          onClick={props.onCloseModal}>
          {props.btnText}
        </Button>
      </Modal.Body>
    </Modal>
  );
};

WarningModal.defaultProps = {
  btnText: "Close",
};

export default WarningModal;
