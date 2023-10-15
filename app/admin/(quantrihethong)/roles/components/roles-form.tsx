"use client";
import { IFormProps } from "@/shared/model";
import { Modal } from "@/shared/components/modal";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import { TanetInput, TanetSelectTreeCheck, TanetCheckbox, TanetTextArea, TanetSelect, SelectAsync, TanetFormDate, TanetCKEditor } from "@/lib";
import { useEffect, useState,useReducer } from "react";
import { array, number, object, ref, string,date } from "yup";
import { rolesServices } from "../services";
import { formReducer,INITIAL_STATE_FORM,computedTitle } from "@/lib/common";
export default function RolesForm({
  show,
  action,
  id,
  onClose,
}: IFormProps) {
  const titleTable="Đối tượng quản lý";  
  const dataDefault = {
        name: '',
    description: '',
  };
  const schema = object({
        name: string().trim().nullable().required('Tên đối tượng không được để trống').max(250, 'Bạn nhập tối đa 250 ký tự'),
    description: string().trim().nullable().max(1000, 'Bạn nhập tối đa 1000 ký tự'),
  });    
  const [state,dispatch] = useReducer(formReducer,INITIAL_STATE_FORM);
  const { data, error, isLoading, mutate } = rolesServices.GetById(id!);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (values: any) => {
    setLoading(true);
    if (id) {
      try {
        await rolesServices.update(id, values);
        toast.success("Cập nhật thành công");
        await mutate();
        await onClose(true);
      } catch (err: any) {
        toast.error("Cập nhật không thành công");
      }
    } else {
      try {
        await rolesServices.create(values);
        toast.success("Thêm thành công");
        await mutate();
        await onClose(true);
      } catch (err: any) {
        toast.error("Thêm mới không thành công");
      }
    }
    setLoading(false);
  };
   useEffect(() => {
    dispatch({type:action});
  }, [action, id]);
  return (
    <>
      <Modal show={show} size="lg" loading={loading}>
        <Formik
          onSubmit={(values) => {
            onSubmit(values);
          }}
          validationSchema={schema}
          initialValues={data ? data : dataDefault}
          enableReinitialize={true}
        >
          {({ handleSubmit}) => (
          <Form noValidate
          onSubmit={handleSubmit}
          onKeyPress={(ev) => {
            ev.stopPropagation();
          }}>
            <Modal.Header onClose={onClose}>{computedTitle(id,state?.editMode, titleTable)}</Modal.Header>
            <Modal.Body nameClass="grid-cols-12">
               <div className='col-span-12'>
	<TanetInput
	label='Tên đối tượng'
	required={true}
	view={state?.viewMode}
	id='name'
	name='name'
	/></div>
<div className='col-span-12'>
	<TanetTextArea
	label='Mô tả'
	required={false}
	view={state?.viewMode}
	rows={3}
	id='description'
	name='description'
	/></div>
            </Modal.Body>
            <Modal.Footer onClose={onClose}>
              {!state?.viewMode ? (
                <>
                  <button
                    data-modal-hide="large-modal"
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Lưu
                  </button>
                </>
              ) : (
                <></>
              )}
            </Modal.Footer>
          </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}
