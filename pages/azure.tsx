import { useState } from 'react';
import Layout from '@/components/layout';
import MultipleFileUploadForm from "@/components/ui//MultipleFileUploadForm";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function Azure() {
    const [uploading, setUploading] = useState<boolean>(false);
    const [cleanDB, setCleanDB] = useState<boolean>(false);
    globalThis._cleanDB = cleanDB;

    const handleChange = (e: { target: { checked: any; }; }) => {
        const { checked } = e.target;
        setCleanDB(checked);
        globalThis._cleanDB = checked;
        console.log("handleChange = " + globalThis._cleanDB);
    }

    const onProcess = async () => {
        toast('开始更新知识库.', { hideProgressBar: true, autoClose: 2000, type: 'success', position: 'top-center' });

        setUploading(true);
        /** Uploading files to the server */
        try {
            const res = await fetch("/api/cleanazure", {
                method: "GET"
            });

            const {
                data,
                error,
            }: {
                data: {
                    url: string | string[];
                } | null;
                error: string | null;
            } = await res.json();

            if (error || !data) {
                alert(error || "Sorry! something went wrong.");
                return;
            }

            console.log("Files were uploaded successfylly:", data);
            toast('知识库更新成功!', { hideProgressBar: true, autoClose: 2000, type: 'success', position: 'top-center' })

        } catch (error) {
            console.error(error);
            alert("Sorry! something went wrong.");
        } finally {
            setUploading(false);
        }
    }


    return (
        <>
            <Layout>
                <img src="/azure.png" alt="Azure" />
                <div className="absolute w-full h-500 top-40 bottom-30 left-10 right-0 flex items-center justify-left">

                <div className="mx-auto flex flex-col gap-4">
                    <main className="py-10">
                        <div className="w-full max-w-3xl px-3 mx-auto">
                            <div className="space-y-10">
                                <div>
                                    <h2 className="mb-3 text-xl font-bold text-black">
                                        上传文件
                                    </h2>
                                    <MultipleFileUploadForm />
                                </div>
                            </div>
                        </div>
                    </main>
                    
                </div>
                </div>

                <div className="absolute w-full h-200 top-21 bottom-10 left-10 right-0 flex items-center justify-center">
                    <div className="mx-auto flex flex-col gap-4">
                        <main className="py-10">
                            <div className="w-full max-w-3xl px-3 mx-auto">
                                <div className="space-y-10">
                                        <button
                                            disabled={uploading}
                                            onClick={onProcess}
                                            className="w-1/2 px-4 py-3 text-xl font-bold transition-colors duration-300 text-white bg-blue-500  rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
                                        >
                                            从Azure空间同步数据
                                        </button>

                                </div>
                            </div>
                        </main>
                        <div className="w-full max-w-3xl px-3 mx-auto">
                            {uploading ?
                                <strong className="text-sm font-medium">同步中 ... </strong> :
                                <strong className="text-sm font-medium"> </strong>
                            }
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </Layout>
        </>
    );
}
