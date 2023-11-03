const supabase = require("../utils/supabase.js");

exports.createMateri = async ({
    jenis_materi,
    nama_bab,
    materinya,
    foto_materi,
    creator,
}) => {
    // Handle the case when "foto_materi" is a text
    if (typeof foto_materi === "string") {
        // Create "materi" with text
        const { data, error } = await supabase.from("materi").insert([
            {
                jenis_materi,
                nama_bab,
                materinya,
                foto_materi: null, // No file to upload
                creator,
            },
        ]);

        if (error) {
            throw error;
        }

        return data[0];
    } else {
        // Handle the case when "foto_materi" is a file
        const filePath = `materi/${nama_bab}`;
        let imageUrl;
        const uniqueFilePath = await getUniqueFilePath(filePath);

        // Upload the file to the storage bucket
        const { data, error } = await supabase.storage
            .from("materi")
            .upload(uniqueFilePath, foto_materi.buffer);

        if (error) {
            throw error;
        }

        imageUrl = `https://wkewzdgfhqcwmrpdjnlv.supabase.co/storage/v1/object/public/materi/${uniqueFilePath}`;

        // Create "materi" with the URL of the uploaded file
        const { data: materiData, error: materiError } = await supabase
            .from("materi")
            .insert([
                {
                    jenis_materi,
                    nama_bab,
                    materinya,
                    foto_materi: imageUrl,
                    creator,
                },
            ]);

        if (materiError) {
            throw materiError;
        }

        return materiData[0];
    }
};

const getUniqueFilePath = async (filePath) => {
    let uniqueFilePath = filePath;
    let i = 0;

    while (true) {
        const { data: fileData, error } = await supabase.storage
            .from("materi")
            .download(uniqueFilePath);

        if (error) {
            break;
        }

        i++;
        uniqueFilePath = `materi/${nama_bab}/${i}`;
    }

    return uniqueFilePath;
};

exports.getAllMateri = async () => {
    // Fetch all "materi" data from the database
    const { data, error } = await supabase.from("materi").select();

    if (error) {
        throw error;
    }

    return data;
};

exports.updateUserProgress = async (email, progressAttribute) => {
    // Fetch the user's current progress
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select(progressAttribute)
        .eq("email", email);

    if (userError) {
        throw userError;
    }

    // Increment the progress by 1
    const currentProgress = userData[0][progressAttribute] || 0;
    const updatedProgress = (currentProgress + 1) / 20;

    // Update the user's progress
    const { data, error } = await supabase
        .from("user")
        .update({ [progressAttribute]: updatedProgress })
        .match({ email });

    if (error) {
        throw error;
    }

    return data;
};

exports.getMateriById = async (materiId) => {
    // Fetch a specific "materi" by ID from the database
    const { data, error } = await supabase
        .from("materi")
        .select()
        .eq("id", materiId);

    if (error) {
        throw error;
    }

    return data[0]; // Return the "materi" object
};

exports.hasUserCompletedMateri = async (userEmail, materiId) => {
    const { data, error } = await supabase
        .from("user_completed_materi")
        .select()
        .eq("user_email", userEmail)
        .eq("materi_id", materiId);

    if (error) {
        throw error;
    }

    return data && data.length > 0;
};

// Function to mark a "materi" as completed for the user
exports.markMateriAsCompleted = async (userEmail, materiId) => {
    const { data, error } = await supabase
        .from("user_completed_materi")
        .upsert([
            {
                user_email: userEmail,
                materi_id: materiId,
            },
        ]);

    if (error) {
        throw error;
    }

    return data;
};

exports.searchMateriByJenis = async (jenis_materi) => {
    // Search "materi" by jenis_materi in the database
    const { data, error } = await supabase
        .from("materi")
        .select()
        .eq("jenis_materi", jenis_materi);

    if (error) {
        throw error;
    }

    return data;
};
