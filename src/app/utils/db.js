import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // await mongoose.connect('mongodb+srv://mubasharshafique93:0Cl4T3zm9hNNIPya@cluster0.3agpkvz.mongodb.net/',
        // await mongoose.connect('mongodb+srv://mubasharshafique93:trKk8luR7B5ReZ7m@cluster0.m6rawwx.mongodb.net/',
        await mongoose.connect('',
            {
                dbName: "Final_Year_Project_2025"
            }

        )

        console.log("mongoDB connected successfully")

    } catch (error) {
        console.log(error.message)
    }
}