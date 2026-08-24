import Contact from "../model/contact.model.js";
import validator from "validator";

export const postContact = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const subject = req.body.subject?.trim();
        const phone = req.body.phone?.trim();
        const message = req.body.message?.trim();

        if (!name || !email || !message) {
            return res.status(400).json({
                message: "Name, email, and message are required",
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        if (phone && !validator.isMobilePhone(phone, "en-IN")) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        if (message.length < 10 || message.length > 1000) {
            return res.status(400).json({
                message: "Message must be between 10 and 1000 characters",
            });
        }

        const contactData = Object.fromEntries(
            Object.entries({
                name,
                email,
                subject,
                phone,
                message,
            }).filter(([_, value]) => value)
        );

        if (req.user && req.user._id) {
            contactData.userId = req.user._id;
            contactData.userType = req.user.role || "customer";
        } else {
            contactData.userType = "guest";
        }

        const newContact = new Contact(contactData);
        await newContact.save();

        return res.status(201).json({
            message: "Contact created successfully",
        });

    } catch (error) {
        console.error("Error creating contact:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json({ data: contacts });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: error.message });
    }
};