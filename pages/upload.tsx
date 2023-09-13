import { useState } from 'react';
import Layout from '@/components/layout';
import MultipleFileUploadForm from "@/components/ui//MultipleFileUploadForm";

export default function Upload() {
    const [cleanDB, setCleanDB] = useState<boolean>(false);
    globalThis._cleanDB = cleanDB;

    const handleChange = (e: { target: { checked: any; }; }) => {
        const { checked } = e.target;
        setCleanDB(checked);
        globalThis._cleanDB = checked;
        console.log("handleChange = " + globalThis._cleanDB);
    }

    return (
        <>
            <Layout>
                <div className="mx-auto flex flex-col gap-4">
                    <main className="py-10">
                        <div className="w-full max-w-3xl px-3 mx-auto">
                            <div className="space-y-10">
                                <div>
                                    <h2 className="mb-3 text-xl font-bold text-gray-900">
                                        File Upload
                                    </h2>
                                    <MultipleFileUploadForm />
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
            </Layout>
        </>
    );
}
