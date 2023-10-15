"use client";
import { Modal } from "@/shared/components/modal";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import { TanetInput } from "@/lib";
import { useState } from "react";
import { object, ref, string } from "yup";
import { userServices } from "../services";
interface IResetPasswordProps {
  show: boolean;
  username?: string | null;
  onClose: (isRefresh: boolean) => void;
}
export default function ResetPassword({
  show,
  username,
  onClose,
}: IResetPasswordProps) {
  const defaultUser = {
    username: "",
    newPassword: "",
    repassword: "",
  };
  const schema = object({
    newPassword: string()
      .trim()
      .required("Bạn phải nhập mật khẩu mới")
      .min(6, "Bạn nhập tối thiểu 6 ký tự")
      .max(30, "Bạn nhập tối đa 30 ký tự")
      .matches(
        /(?=^.{6,30}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        "Mật khẩu phải có ít nhất một chữ số, một chữ cái hoa, một chữ cái thường, một ký tự đặc biệt"
      ),
    repassword: string()
      .trim()
      .required("Bạn chưa nhập lại mật khẩu")
      .oneOf([ref("newPassword"), ""], "Mật khẩu nhập lại không đúng"),
  });
  const [loading, setLoading] = useState(false);
  const onSubmit = async (values: any) => {
    setLoading(true);

    try {
      await userServices.ResetPassword({
        username: username,
        newPassword: values.newPassword,
        repassword: values.repassword,
      });

      setLoading(false);

      toast.success("Đổi mật khẩu thành công");

      await onClose(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
      await onClose(false);
    }
  };

  return (
    <>
      <Modal show={show} size="md" loading={loading}>
        <Formik
          onSubmit={(values) => {
            onSubmit(values);
          }}
          validationSchema={schema}
          initialValues={defaultUser}
          enableReinitialize={true}
        >
          <Form>
            <Modal.Header onClose={onClose}>Reset mật khẩu</Modal.Header>
            <Modal.Body>
              <div className="">
                <TanetInput
                  label="Mật khẩu"
                  required={true}
                  id="newPassword"
                  name="newPassword"
                  type="password"
                />
              </div>
              <div className="">
                <TanetInput
                  label="Nhập lại mật khẩu"
                  required={true}
                  id="repassword"
                  name="repassword"
                  type="password"
                />
              </div>
            </Modal.Body>
            <Modal.Footer onClose={onClose}>
              <>
                <button
                  data-modal-hide="large-modal"
                  type="submit"
                  className="btn-submit"
                >
                  Lưu
                </button>
              </>
            </Modal.Footer>
          </Form>
        </Formik>
      </Modal>
    </>
  );
}
