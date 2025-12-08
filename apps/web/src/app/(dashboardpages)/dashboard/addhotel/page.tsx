"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";

type ImageItem = {
  file: File | null;
  preview: string | null;
};

type FormValues = {
  name: string;
  uploads: ImageItem[];
};

export default function AddHotelForm() {
  const { register, control, handleSubmit, watch, setValue } =
    useForm<FormValues>({
      defaultValues: {
        name: "",
        uploads: [{ file: null, preview: null }],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "uploads",
  });

  const [publishing, setPublishing] = useState(false);

  // watch all uploads
  const uploads = watch("uploads");

  const onSubmit = async (data: FormValues) => {
    try {
      setPublishing(true);

      const formData = new FormData();

      formData.append("name", data.name);

      data.uploads.forEach((u) => {
        if (u.file) formData.append("images", u.file);
      });

      // Show formData
      console.log("FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("Submitting hotel:", formData);
      //   const res = await axios.post("/api/hotel/create", formData, {
      //     headers: { "Content-Type": "multipart/form-data" },
      //   });

      //   console.log(res.data);
      alert("Published!");
    } catch (err) {
      console.error(err);
      alert("Upload Error");
    } finally {
      setPublishing(false);
    }
  };

  // handle file change + preview
  const handleImageSelect = (index: number, file: File | null) => {
    const preview = file ? URL.createObjectURL(file) : null;

    setValue(`uploads.${index}.file`, file);
    setValue(`uploads.${index}.preview`, preview);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-gray-600">
      {/* header */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-semibold">Add Hotels</h1>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={publishing}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg shadow"
        >
          {publishing ? "Publishing..." : "Publish"}
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6">
          {/* Hotel Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              {...register("name")}
              placeholder="Enter Hotel Name"
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {/* Images with Add More */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Featured Image
            </label>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="relative">
                  {uploads[index]?.preview && (
                    <Image
                      src={uploads[index].preview!}
                      width={300}
                      height={200}
                      alt="preview"
                      className="rounded mb-2 border"
                    />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageSelect(
                        index,
                        e.target.files ? e.target.files[0] : null
                      )
                    }
                    className="border rounded px-2 py-2"
                  />

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ file: null, preview: null })}
              className="mt-4 bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-lg"
            >
              Add More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
