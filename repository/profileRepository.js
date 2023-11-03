const supabase = require("../utils/supabase.js");
const bcrypt = require("bcrypt");

exports.updateProfilePicture = async (email, file) => {
    const getUniqueFilePath = async (filePath) => {
        let uniqueFilePath = filePath;
        let i = 0;

        while (true) {
            const { data: fileData, error } = await supabase.storage
                .from("profile_pictures")
                .download(uniqueFilePath);

            if (error) {
                break;
            }

            i++;
            uniqueFilePath = `profile_pictures/${email}/${i}`;
        }

        return uniqueFilePath;
    };

    const filePath = `profile_pictures/${email}/0`;
    let imageUrl;
    const uniqueFilePath = await getUniqueFilePath(filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile_pictures")
        .upload(uniqueFilePath, file.buffer);

    if (uploadError) {
        throw uploadError;
    }

    imageUrl = `https://wkewzdgfhqcwmrpdjnlv.supabase.co/storage/v1/object/public/profile_pictures/${uniqueFilePath}`;

    const { data: updateData, error: updateError } = await supabase
        .from("user")
        .update({ foto: imageUrl })
        .match({ email });

    if (updateError) {
        throw updateError;
    }

    const { data: updatedProfileData, error: profileError } = await supabase
        .from("user")
        .select()
        .eq("email", email);

    if (profileError) {
        throw profileError;
    }

    return updatedProfileData[0];
};

exports.updateUserProfile = async (email, userData) => {
    const updatedFields = {
        about: userData.about,
        foto: userData.foto,
        notelp: userData.notelp,
        alamat: userData.alamat,
        html_progress: userData.html_progress,
        css_progress: userData.css_progress,
        javascript_progress: userData.javascript_progress,
    };

    const { data, error } = await supabase
        .from("user")
        .update(updatedFields)
        .match({ email });

    if (error) {
        throw error;
    }

    const { data: updatedProfileData, profileError } = await supabase
        .from("user")
        .select()
        .eq("email", email);

    if (profileError) {
        throw profileError;
    }

    return updatedProfileData[0];
};

exports.resetPassword = async (email, oldPassword, newPassword) => {
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("password")
        .eq("email", email);

    if (userError) {
        throw userError;
    }

    if (userData.length === 0) {
        throw new Error("User not found.");
    }

    const isPasswordValid = await bcrypt.compare(
        oldPassword,
        userData[0].password
    );

    if (!isPasswordValid) {
        throw new Error("Old password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
        .from("user")
        .update({ password: hashedPassword })
        .match({ email });

    if (error) {
        throw error;
    }

    return { message: "Password reset successful." };
};

exports.getUserProfile = async (email) => {
    const { data: userProfileData, error } = await supabase
        .from("user")
        .select(
            "email, username, about, foto, notelp, alamat, html_progress, css_progress, javascript_progress"
        )
        .eq("email", email);

    if (error) {
        throw error;
    }

    return userProfileData[0];
};

exports.deleteUserProfile = async (email) => {
    const { data: userProfileData, error: profileError } = await supabase
        .from("user")
        .select("foto")
        .eq("email", email);

    if (profileError) {
        throw profileError;
    }

    // Delete the user's profile from the database
    const { data, error } = await supabase
        .from("user")
        .delete()
        .match({ email });

    if (error) {
        throw error;
    }
    const filePath = `profile_pictures/${email}/0`;
    if (userProfileData.length > 0) {
        const fotoUrls = userProfileData[0].foto;

        for (const fotoUrl of fotoUrls) {
            const fileName = fotoUrl.split("/").pop();

            const { error: deleteError } = await supabase.storage
                .from("profile_pictures")
                .remove([filePath]);

            if (deleteError) {
                throw deleteError;
            }
        }
    }

    return {
        message: "User profile and profile pictures deleted successfully.",
    };
};
