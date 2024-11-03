import { auth, db, googleProvider } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

// Fetch all blobs for the current user

let userId = null; // Global variable to hold the authenticated user ID

// Sign in using the access token from the user object
export function signInWithUserToken(user) {
    if (!user) {
        console.error("User object is not provided or invalid.");
        return;
    }

    // // Fetch the fresh ID token
    // user.getIdToken()
    //     .then((idToken) => {
    //         if (!idToken) {
    //             console.error("Failed to retrieve a valid ID token.");
    //             return;
    //         }

    //         const credential = GoogleAuthProvider.credential(idToken);

    //         // Sign in using the fetched credential
    //         signInWithCredential(auth, credential)
    //             .then((result) => {
    //                 userId = result.user.uid; // Set the user ID globally after successful sign-in
    //             })
    //             .catch((error) => {
    //                 console.error('Error signing in with credential:', error);
    //             });
    //     })
    //     .catch((error) => {
    //         console.error("Error retrieving ID token:", error);
    //     });
}

export function fetchAllBlobs(userId) {
    if (!userId) {
        console.error("User is not authenticated");
        return Promise.reject("User is not authenticated");
    }
    const blobsCollectionRef = collection(db, "blobs");
    const q = query(blobsCollectionRef, where("userId", "==", userId));

    return getDocs(q)
        .then(snapshot => {
            const blobs = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Parse the JSON string back into an object
                const parsedData = JSON.parse(data.data);
                blobs.push({
                    updated_at: data.updated_at,
                    id: doc.id,
                    data: parsedData
                });
            });
            return blobs; // Return the array of blobs
        })
        .catch(error => {
            console.error("Error fetching blobs:", error);
            throw error; // Propagate the error
        });
}

// Update a blob
export function updateBlob(blobName, newBlobData, userId) {
    if (!userId) {
        console.error("User is not authenticated");
        return;
    }
    const blobRef = doc(db, "blobs", blobName);

    updateDoc(blobRef, {
        data: newBlobData,
        userId: userId // Ensure the user ID is updated as well
    })
        .then(() => {
            console.log("Blob updated successfully!");
        })
        .catch(error => {
            console.error("Error updating blob:", error);
        });
}

// Create a new blob
export function createBlob(blobName, blobData, userId) {
    if (!userId) {
        console.error("User is not authenticated");
        return;
    }

    // Ensure blobName is a valid string
    if (typeof blobName !== 'string') {
        console.error("Blob name must be a string");
        return;
    }

    // Create a reference to the document in the "blobs" collection
    const blobRef = doc(db, "blobs", blobName);

    // Set the document data, including the userId
    setDoc(blobRef, {
        data: blobData,
        userId: userId, // Store the user's ID
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
    })
        .then(() => {
            console.log("Blob created successfully!");
        })
        .catch((error) => {
            console.error("Error creating blob:", error);
            // Handle the error appropriately (e.g., display an error message to the user)
        });
}

// Delete a blob
export function deleteBlob(blobName, userId) {
    if (!userId) {
        console.error("User is not authenticated");
        return Promise.reject("User is not authenticated");
    }
    const blobRef = doc(db, "blobs", blobName);

    return deleteDoc(blobRef)
        .then(() => {
            console.log("Blob deleted successfully!");
        })
        .catch(error => {
            console.error("Error deleting blob:", error);
            throw error; // Propagate the error
        });
}

// Save a blob (overwrites existing blob with the same name)
export async function saveBlob(blobName, blobData, userId) {
    if (!userId) {
        console.error("User is not authenticated");
        return Promise.reject("User is not authenticated");
    }
    const blobRef = doc(db, "blobs", blobName);

    // Convert blobData to a JSON string
    const dataToSave = JSON.stringify(blobData);
    try {

        await setDoc(blobRef, {
            data: dataToSave,
            userId: userId,
            updated_at: serverTimestamp()  // Always update updated_at
        }, { merge: true });

        console.log("Blob saved successfully!");
    } catch (error) {
        console.error("Error saving blob:", error);
        throw error; // Propagate the error
    }
}
