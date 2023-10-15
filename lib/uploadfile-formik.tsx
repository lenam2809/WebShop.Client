/* eslint-disable @next/next/no-img-element */
import { FormikErrors } from "formik";
import { useMemo, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ApiUrl } from "@/public/app-setting";
import { userServices } from "@/app/admin/(quantrihethong)/users/services";
import { AiFillDelete } from "react-icons/ai";
import { MdDownload } from "react-icons/md";
import { useFormikContext } from "formik";
import Image from "next/image";

interface FormatDropzone {
    errors?: FormikErrors<{ fileAttachs?: any }>;
    fileType: string;
    maxFiles: number;
    action: string;
    onDataUpdate?: any;
    data: any[];
    nameAttach: string;
    nameDelete: string;
    loading: any;
    isThumbnail?: any;
}

const baseStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    padding: "20px",
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#2196f3",
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    color: "#2196f3",
    outline: "none",
    transition: "border .24s ease-in-out",
};

const focusedStyle = {
    borderColor: "#2196f3",
};

const acceptStyle = {
    borderColor: "#00e676",
};

const rejectStyle = {
    borderColor: "#ff1744",
};

export const UploadFile = ({
    errors,
    fileType,
    maxFiles,
    action,
    data,
    nameAttach,
    nameDelete,
    loading,
    isThumbnail
}: FormatDropzone) => {
    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: {}, // file type hợp lệ
        noClick: true,
        noKeyboard: true,
        maxFiles: maxFiles, // max files được upload
        onDrop: (acceptedFiles) => {
            acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            );

            configFile(acceptedFiles);
        },
    });

    const style = useMemo(
        () => ({
            ...baseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isFocused, isDragAccept, isDragReject]
    );

    const { setFieldValue } = useFormikContext();

    //danh sách file có trong component bao gồm file lỗi
    const [innerValue, setInnerValue] = useState<any[]>([]);

    //danh sách file có trong component không bao gồm file lỗi
    const [fileAttach, setfileAttach] = useState<any[]>();
    const [lstIdDelete, setlstIdDelete] = useState<any[]>([]);
    const [errorMaxFiles, setErrorMaxFiles] = useState(false);
    const lstTypeFile = getTypeFile(fileType);
    const maxSize = 50;

    /**
     *
     * @param file lấy danh sách định dạng file được dùng
     * @returns
     */

    function getTypeFile(file: string) {
        switch (file) {
            case "fileImage":
                return ["jpg", "jpeg", "png"];
            case "fileDocument":
                return ["doc", "docx", "xls", "xlsx", "pdf"];
            default:
                return [];
        }
    }

    function onChangeHandler(event: any) {
        let files: File[] = new Array<File>();
        files = event.target.files;
        configFile(files);
    }

    function configFile(files: any) {
        let totalFiles = [...files];

        // check file type hợp lệ
        let totalArr = Array.from(totalFiles).map((file: any) => {
            file.preview = URL.createObjectURL(file);
            file.filetype = file.name.split(".").pop();
            file.title = file.name;
            file.error = new Array();
            if (checkFileType(file.filetype) !== "")
                file.error.push(checkFileType(file.name.split(".").pop()));
            if (checkSize(file.size) !== "") file.error.push(checkSize(file.size));
            return file;
        });
        // check nếu tồn tại rồi xóa file cũ thay thế file mới
        if (action == 'add' && innerValue) {
            innerValue?.forEach((element) => {
                if (totalArr.filter(file => file.name === element.name).length == 0)
                    totalArr.push(element);
            });
        }
        //trong trường hợp sửa sẽ vẫn thêm file mới
        else {
            innerValue?.forEach((element) => {
                totalArr.push(element);
            });
        }

        //arr.map(x => {
        //    if (this.state.innerValue.indexOf(x) > -1)
        //        delete this.state.innerValue[this.state.innerValue.indexOf(x)];
        //})

        let arrRe = new Array();
        totalArr.map((x) => {
            if ((!x.error || (x.error && x.error.length == 0)))
                arrRe.push(x);
        });
        if (arrRe.length > maxFiles) {
            setErrorMaxFiles(true);
        } else {
            setErrorMaxFiles(false);
            setFieldValue(nameAttach, arrRe);
            setInnerValue([...totalArr]);
            setfileAttach([...arrRe]);
        }

        console.log('inner', innerValue);
    }

    function checkSize(size: any) {
        if (maxSize * 1000000 >= size) return "";
        else return "Dung lượng file vượt quá cho phép";
    }

    // xóa file
    function deleteFiles(e: any) {
        var array = innerValue;
        let idsDelete = lstIdDelete;
        var index = array?.indexOf(e);
        if (index !== -1 && array !== undefined) {
            if (array[index].id)
                idsDelete.push(array[index].id);
            array.splice(index, 1);
        }

        let arrRe = new Array();
        array.map((x) => {
            if (!x.error || (x.error && x.error.length == 0))
                arrRe.push(x);
        });
        if (arrRe.length > maxFiles) {
            setErrorMaxFiles(true);
        } else {
            setErrorMaxFiles(false);
        }
        setInnerValue([...array]);
        setfileAttach([...arrRe]);
        setlstIdDelete([...lstIdDelete]);
        setFieldValue(nameAttach, arrRe);
        setFieldValue(nameDelete, lstIdDelete);
    }

    // check file type hợp lệ
    function checkFileType(file: string): string {
        if (lstTypeFile.indexOf(file.toLowerCase()) > -1) return "";
        else return "Định dạng file không được phép tải lên";
    }

    const onDownload = async (url: any) => {
        let res = await userServices.gettime();
        let a = document.createElement("a");
        a.href = ApiUrl + url + "/" + res;
        a.target = "_blank";
        a.click();
    };

    const [key, setKey] = useState('')

    const onDisplay = async () => {
        let res = await userServices.gettime();
        setKey(res);
    };

    function shortText(file: any, length: any) {
        if (file.title.length > length) {
            if (file.format) {
                return file.title.slice(0, length - 2) + '...' + file.format;
            } else {
                return file.title.slice(0, length - 2) + '....' + file.filetype;
            }
        } else {
            return file.title;
        }
    }

    useEffect(() => {
        if (data) {
            setInnerValue([...data]);
        }
        onDisplay();
    }, [loading]);

    return (
        <section className="container">
            <div {...getRootProps({ style })}>
                <p className="mb-2 text-gray-500 text-xs">
                    (Định dạng cho phép: {lstTypeFile.toString()})
                </p>
                {action == "add" || action == "edit" ? (
                    <button
                        type="button"
                        className="bg-green-400 cursor-pointer flex hover:bg-green-500 px-5 py-2 text-sm leading-5 rounded-md font-semibold text-white"
                    >
                        <label id="file-input-label" htmlFor="file-input">
                            Thêm tệp
                        </label>
                    </button>
                ) : (
                    <></>
                )}
                <input
                    type="file"
                    id="file-input"
                    name="fileAttachs"
                    className="hidden"
                    onChange={(e) => {
                        onChangeHandler(e);
                        //if (e.currentTarget.files) {
                        // setFieldValue("fileAttachs", e.currentTarget.files);
                        //}
                    }}
                    multiple={maxFiles > 1 ? true : false}
                />
                <hr />
                <ul>
                    <div className="grid gap-4">
                        {innerValue?.map((file: any, index) => {
                            return (
                                <li
                                    className=""
                                    key={index}
                                    style={{ display: "flex", alignItems: "center" }}
                                >
                                    {
                                        <>
                                            <div style={{ margin: "0px", marginLeft: "10px" }}>
                                                {
                                                    isThumbnail ?
                                                        <div>
                                                            {
                                                                file.filetype == "doc" || file.filetype == "docx" || file.format == ".doc" || file.format == ".docx" ?
                                                                    <div>
                                                                        <Image
                                                                            title={file.title}
                                                                            src="/doc.png"
                                                                            alt="File Word"
                                                                            height={80}
                                                                            width={80}
                                                                        />
                                                                    </div>
                                                                    :
                                                                    <div>
                                                                        {
                                                                            file.filetype == "xls" || file.filetype == "xlsx" || file.format == ".xls" || file.format == ".xlsx" ?
                                                                                <div>
                                                                                    <Image
                                                                                        title={file.title}
                                                                                        src="/excel.png"
                                                                                        alt="File Excel"
                                                                                        height={80}
                                                                                        width={80}
                                                                                    />
                                                                                </div>
                                                                                :
                                                                                <div>
                                                                                    {
                                                                                        file.filetype == "pdf" || file.format == ".pdf" ?
                                                                                            <div>
                                                                                                <Image
                                                                                                    title={file.title}
                                                                                                    src="/pdf.png"
                                                                                                    alt="File PDF"
                                                                                                    height={80}
                                                                                                    width={80}
                                                                                                />
                                                                                            </div>
                                                                                            :
                                                                                            <div>
                                                                                                {
                                                                                                    fileType == "fileImage" ?
                                                                                                        <div>
                                                                                                            {
                                                                                                                file.id ?
                                                                                                                    <div>
                                                                                                                        <Image
                                                                                                                            title={file.title}
                                                                                                                            src={`${ApiUrl}${file.url}/${key}`}
                                                                                                                            alt="Không có hiển thị"
                                                                                                                            height={80}
                                                                                                                            width={80}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    :
                                                                                                                    <div>
                                                                                                                        <Image
                                                                                                                            title={file.title}
                                                                                                                            src={file.preview}
                                                                                                                            alt="Không có hiển thị"
                                                                                                                            height={80}
                                                                                                                            width={80}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                            }
                                                                                                        </div>
                                                                                                        :
                                                                                                        <div></div>
                                                                                                }
                                                                                            </div>
                                                                                    }
                                                                                </div>
                                                                        }
                                                                    </div>
                                                            }
                                                        </div>
                                                        :
                                                        <div></div>
                                                }
                                                <div className="flex flex-row">
                                                    <p title={file.title}>
                                                        {shortText(file, 8)}
                                                    </p>
                                                    {action == "add" || action == "edit" ? (
                                                        <div>
                                                            <button
                                                                type="button"
                                                                className="ml-1"
                                                                style={{ color: "red" }}
                                                                onClick={() => deleteFiles(file)}
                                                            >
                                                                <AiFillDelete />
                                                            </button>
                                                            <small style={{ color: "red", marginLeft: "10px" }}>
                                                                {file.error?.map((err: any, index: any) => {
                                                                    return <span key={index}>{err} </span>;
                                                                })}
                                                            </small>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-row">
                                                            <button
                                                                type="button"
                                                                className="ml-1"
                                                                onClick={() => onDownload(file.url)}
                                                            >
                                                                <MdDownload />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    }
                                </li>
                            );
                        })}
                    </div>
                    <div>
                        {errorMaxFiles == true ? (
                            <p style={{ color: "red" }}>
                                Số file tải lên vượt quá mức quy định!
                            </p>
                        ) : (
                            ""
                        )}
                    </div>
                </ul>
            </div>
        </section>
    );
};
