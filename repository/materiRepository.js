const supabase = require("../utils/supabase.js");

exports.createMateri = async ({
    jenis_materi,
    nama_bab,
    materinya,
    foto_materi,
    creator,
}) => {
    // Split the materinya text into an array using a semicolon as the delimiter
    let materiArray = materinya.split(";");

    // Initialize an array to store the URLs of the uploaded files
    let foto_materi_urls = [];

    // Iterate over each file in "foto_materi"
    for (let i = 0; i < foto_materi.length; i++) {
        const filePath = `materi/${nama_bab}`;
        let imageUrl;
        const uniqueFilePath = await getUniqueFilePath(filePath);

        // Upload the file to the storage bucket
        const { data, error } = await supabase.storage
            .from("materi")
            .upload(uniqueFilePath, foto_materi[i].buffer);

        if (error) {
            throw error;
        }

        imageUrl = `https://wkewzdgfhqcwmrpdjnlv.supabase.co/storage/v1/object/public/materi/${uniqueFilePath}`;

        // Add the URL of the uploaded file to the array
        foto_materi_urls.push(imageUrl);
    }

    // Create "materi" with the URLs of the uploaded files and the materinyaArray
    const { data: materiData, error: materiError } = await supabase
        .from("materi")
        .insert(
            [
                {
                    jenis_materi,
                    nama_bab,
                    materinya: materiArray,
                    foto_materi: foto_materi_urls,
                    creator,
                },
            ],
            { returning: "minimal" }
        );

    if (materiError) {
        throw materiError;
    }

    if (materiData && materiData.length > 0) {
        return materiData[0];
    } else {
        throw new Error("Insert operation was not successful");
    }
};

const getUniqueFilePath = async (filePath, nama_bab) => {
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
    const updatedProgress = (currentProgress + 1) / 4;

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

exports.deleteMateri = async (id) => {
    // Fetch the "materi" to be deleted
    const { data: materiData, error: fetchError } = await supabase
        .from("materi")
        .select("nama_bab")
        .eq("id", id);

    if (fetchError) {
        throw fetchError;
    }

    // Delete the "materi" from the database
    const { data: deleteData, error: deleteError } = await supabase
        .from("materi")
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw deleteError;
    }

    // Delete the corresponding storage bucket
    const { data: bucketData, error: bucketError } = await supabase.storage
        .from("materi")
        .remove([`materi/${materiData[0].nama_bab}`]);

    if (bucketError) {
        throw bucketError;
    }

    return deleteData;
};

exports.updateCoverPhoto = async (id, file) => {
    // Fetch the `nama_bab` attribute from the materi table based on the provided `id`
    const { data: materiData, error: materiError2 } = await supabase
        .from("materi")
        .select("nama_bab")
        .eq("id", id);

    if (materiError2) {
        throw materiError2;
    }

    const nama_bab = materiData[0].nama_bab;

    const getUniqueFilePath = async (filePath) => {
        let uniqueFilePath = filePath;
        let i = 0;

        while (true) {
            const { data: fileData, error } = await supabase.storage
                .from("foto_cover")
                .download(uniqueFilePath);

            if (error) {
                break;
            }

            i++;
            uniqueFilePath = `foto_cover/${nama_bab}/${i}`;
        }

        return uniqueFilePath;
    };

    const filePath = `foto_cover/${nama_bab}/0`;
    let imageUrl;
    const uniqueFilePath = await getUniqueFilePath(filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("foto_cover")
        .upload(uniqueFilePath, file.buffer);

    if (uploadError) {
        throw uploadError;
    }

    imageUrl = `https://wkewzdgfhqcwmrpdjnlv.supabase.co/storage/v1/object/public/foto_cover/${uniqueFilePath}`;

    const { data: updateData, error: updateError } = await supabase
        .from("materi")
        .update({ foto_cover: imageUrl })
        .eq("id", id);

    if (updateError) {
        throw updateError;
    }

    const { data: updatedMateriData, error: materiError } = await supabase
        .from("materi")
        .select()
        .eq("id", id);

    if (materiError) {
        throw materiError;
    }

    return updatedMateriData[0];
};
