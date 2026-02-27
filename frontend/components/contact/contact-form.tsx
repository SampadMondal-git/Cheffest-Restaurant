import { useState } from "react";

function ContactForm() {

    type Form = {
        name: string
        email: string
        subject: string
        phone: string
        message: string
    }

    const initialForm: Form = {
        name: "",
        email: "",
        subject: "",
        phone: "",
        message: ""
    }
    const [form, setForm] = useState<Form>(initialForm)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.name || !form.email || !form.subject || !form.message) {
            console.error("Missing required fields")
            return
        }

        console.log("Submitting form:", form)

        setForm(initialForm)
    }



    return (
        <div className="flex justify-center items-center flex-col py-12 gap-4 text-center">
            <div className="max-w-3xl flex flex-col gap-6 bg-[#fff6ea] p-20 rounded-2xl">
                <h3 className="uppercase text-lg border-t border-b border-[#ff9900] font-bold w-fit mx-auto tracking-[0.3rem]">
                    Contact Us
                </h3>

                <h1 className="text-4xl text-center font-bold">
                    Send Valuable Feedback To Us
                </h1>

                <div className="form max-w-xl">
                    <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Name"
                            name="name"
                            value={form.name}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={form.email}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Subject"
                            name="subject"
                            value={form.subject}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="tel"
                            placeholder="Phone"
                            name="phone"
                            value={form.phone}
                            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={handleChange}
                        />

                        <textarea
                            placeholder="Message"
                            name="message"
                            value={form.message}
                            rows={5}
                            className="col-span-2 border border-gray-300 rounded-md px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="submit"
                            className="col-span-2 mt-4 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactForm;
