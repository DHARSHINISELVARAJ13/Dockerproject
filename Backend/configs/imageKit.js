import ImageKit from "imagekit";

let imagekit = null;

// Only initialize ImageKit if credentials are provided
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
    console.log("ImageKit initialized successfully");
} else {
    console.log("ImageKit credentials not found - using local file storage");
}

export default imagekit;