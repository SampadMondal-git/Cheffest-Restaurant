import { useState } from "react";
import sendFeedback from "../../api/feedback";
import { useConfirmation } from "../../src/contexts/useConfirmation";

function ContactForm() {

    type Form = {
        name: string
        email: string
        phone: string
        subject: string
        message: string
    }

    const initialForm: Form = {
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    }
    const [form, setForm] = useState<Form>(initialForm)

    const { setType } = useConfirmation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await sendFeedback(form);

            console.log(response);

            setForm(initialForm);
            setType("feedback");
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className="flex w-full flex-col items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl flex flex-col gap-6 rounded-md border border-orange-100 bg-[#fff6ea] p-6 shadow-lg sm:p-8 lg:p-12">
                <div className="relative mx-auto w-fit px-4 text-center">
                    {/* Top-left corner */}
                    <span className="absolute -left-2 -top-2 h-5 w-5 border-l-2 border-t-2 border-[#ff9900]" />

                    {/* Bottom-right corner */}
                    <span className="absolute -bottom-2 -right-2 h-5 w-5 border-b-2 border-r-2 border-[#ff9900]" />

                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-[#ff9900]" />

                        <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff9900] sm:text-sm">
                            Contact Us
                        </h3>

                        <span className="h-px w-8 bg-[#ff9900]" />
                    </div>

                    <h1 className="mt-5 text-center text-2xl font-bold sm:text-2xl lg:text-3xl">
                        We Value Your Feedback
                    </h1>
                </div>

                <div className="w-full">
                    <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Name"
                            name="name"
                            value={form.name}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={form.email}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Subject"
                            name="subject"
                            value={form.subject}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        />

                        <input
                            type="tel"
                            placeholder="Phone (Optional)"
                            name="phone"
                            value={form.phone}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />

                        <textarea
                            placeholder="Message"
                            name="message"
                            value={form.message}
                            rows={5}
                            className="sm:col-span-2 w-full border border-gray-300 rounded-md px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            required
                        />

                        <button
                            type="submit"
                            className="mt-4 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer sm:col-span-2"
                        >
                            Submit Feedback
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactForm;
