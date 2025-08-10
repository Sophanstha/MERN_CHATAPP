const uploadFile = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/dba000dkc/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chatapp-file"); // Ensure preset is correct
  
    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }
  
      const redata = await res.json();
  
      if (!redata.secure_url) {
        throw new Error("No secure_url returned from Cloudinary");
      }
  
      return redata;
    } catch (error) {
      console.error("File upload error:", error);
      return null;
    }
  };
  
  export default uploadFile;
  