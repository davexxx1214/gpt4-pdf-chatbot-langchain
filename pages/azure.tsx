import { useState } from 'react';
import Layout from '@/components/layout';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function Azure() {
    const [cleanDB, setCleanDB] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);

    globalThis._cleanDB = cleanDB;

    const handleChange = (e: { target: { checked: any; }; }) => {
        const { checked } = e.target;
        setCleanDB(checked);
        globalThis._cleanDB = checked;
        console.log("handleChange = " + globalThis._cleanDB);
    }

    const onProcess = async () => {
        toast('Sync started.', { hideProgressBar: true, autoClose: 2000, type: 'success', position: 'top-center' });

        setUploading(true);
        /** Uploading files to the server */
        try {
            const res = await fetch(globalThis._cleanDB ? "/api/cleanazure" : "/api/azure", {
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
            toast('Files were synced successfylly!', { hideProgressBar: true, autoClose: 2000, type: 'success', position: 'top-center' })

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
            <div className="mx-auto flex flex-col gap-4">
                <main className="py-10">
                    <div className="w-full max-w-3xl px-3 mx-auto">
                        <div className="space-y-10">
                            <div>
                                <button
                                    disabled={uploading}
                                    onClick={onProcess}
                                    className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
                                >
                                    Sync from Azure storage container
                                </button>
                                {uploading ?
                                    <strong className="text-sm font-medium">Syncing ... </strong> :
                                    <strong className="text-sm font-medium"> </strong>
                                }
                            </div>
                        </div>
                    </div>
                </main>
                <div className="w-full max-w-3xl px-3 mx-auto">
                    <input
                        type="checkbox"
                        name="checkall"
                        checked={cleanDB}
                        onChange={handleChange}
                    />
                    <label htmlFor="checkall">Clean Vector Database</label>
                </div>
            </div>
            <ToastContainer />
        </Layout>
    </>
);
}
