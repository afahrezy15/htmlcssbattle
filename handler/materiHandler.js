const materiRepository = require("../repository/materiRepository");

exports.createMateri = async (req, res) => {
    try {
        const { jenis_materi, nama_bab, materinya, creator } = req.body;
        const foto_materi = req.files; // Use req.files to get the uploaded files

        // Call the repository function to create "materi"
        const createdMateri = await materiRepository.createMateri({
            jenis_materi,
            nama_bab,
            materinya,
            foto_materi,
            creator,
        });

        // Debugging statements to check materiData and materiError
        console.log("materiData:", createdMateri);

        if (createdMateri) {
            res.status(201).json({ success: true, createdMateri });
        } else {
            res.status(500).json({
                success: false,
                error: "Insert operation was not successful",
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllMateri = async (req, res) => {
    try {
        // Call the repository function to get all "materi"
        const allMateri = await materiRepository.getAllMateri();
        res.status(200).json(allMateri);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMateriById = async (req, res) => {
    try {
        const materiId = req.params.id;
        const { email } = req.user; // Get the user's email from the token

        let materi; // Declare materi variable

        // Check if the user has already completed this materi
        const hasCompletedMateri =
            await materiRepository.hasUserCompletedMateri(email, materiId);

        if (!hasCompletedMateri) {
            // User hasn't completed this materi, update the progress
            materi = await materiRepository.getMateriById(materiId);

            // Update the user's progress based on the "materi" jenis_materi
            await updateProgress(email, materi.jenis_materi);

            // Mark the "materi" as completed for the user
            await materiRepository.markMateriAsCompleted(email, materiId);
        }

        if (!materi) {
            // Fetch the "materi" data if it wasn't previously fetched
            materi = await materiRepository.getMateriById(materiId);
        }

        res.status(200).json(materi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to update the user's progress
const updateProgress = async (email, jenis_materi) => {
    // Define the progress attributes to update based on jenis_materi
    const progressAttributes = {
        HTML: "html_progress",
        CSS: "css_progress",
        JavaScript: "javascript_progress",
    };

    const progressAttribute = progressAttributes[jenis_materi];

    if (!progressAttribute) {
        throw new Error("Invalid jenis_materi");
    }

    // Call a repository function to update the user's progress
    await materiRepository.updateUserProgress(email, progressAttribute);
};

exports.searchMateriByJenis = async (req, res) => {
    try {
        const jenis_materi = req.params.jenis_materi;

        // Call the repository function to search "materi" by jenis_materi
        const materi = await materiRepository.searchMateriByJenis(jenis_materi);
        res.status(200).json(materi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMateri = async (req, res) => {
    try {
        const { id } = req.params;

        // Call the repository function to delete "materi"
        const deletedMateri = await materiRepository.deleteMateri(id);

        res.status(200).json(deletedMateri);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCoverPhoto = async (req, res) => {
    try {
        const id = req.params.id; // Assuming id is passed in the request parameters
        const file = req.file;
        const nama_bab = req.body.nama_bab; // Assuming nama_bab is in the request body

        const result = await materiRepository.updateCoverPhoto(
            id,
            file,
            nama_bab
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
