// app/dashboard/add-blog/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { RiImageAddLine } from "react-icons/ri";
type FormValues = {
  title: string;
  category: string;
  shortDescription: string;
  content: string;
  tags: string;
  author: string;
  featured?: FileList;
};

export default function AddBlogPage() {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      title: "",
      category: "Destinations",
      shortDescription: "",
      content: "",
      tags: "",
      author: "",
    },
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // watch featured file to show preview
  const featured = watch("featured");

  // update preview when file selected
  React.useEffect(() => {
    if (featured && featured.length > 0) {
      const file = featured[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [featured]);

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("shortDescription", data.shortDescription);
      formData.append("content", data.content);
      formData.append("tags", data.tags); // comma separated
      formData.append("author", data.author);

      if (data.featured && data.featured.length > 0) {
        formData.append("featured", data.featured[0]);
      }

      // show entries in console
      console.log("FormData entries:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // example axios call (uncomment when API ready)
      // const res = await axios.post("/api/blog/create", formData, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      // console.log("API response:", res.data);

      alert("Demo submit complete (console has FormData).");
      reset();
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-600">
      {/* Header with Publish */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-semibold">Add New Blog</h1>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={submitting}
          className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-lg"
        >
          {submitting ? "Publishing..." : "Publish Blog"}
        </button>
      </div>

      {/* Form card */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Row 1: Title + Category */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                {...register("title", { required: true })}
                placeholder="Enter The Title Of The Blog"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                {...register("category")}
                placeholder="Destinations"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Row 2: Featured Image + Short Description */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Featured Image
              </label>

              {/* placeholder / preview box */}
              <label
                htmlFor="featured"
                className="flex items-center justify-center border border-dashed rounded-md h-36 cursor-pointer overflow-hidden"
                style={{ background: "#fafafa" }}
              >
                {preview ? (
                  // use normal img since preview is object url; Next/Image works too but plain img is simplest here
                  <img
                    src={preview}
                    alt="preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <RiImageAddLine className="w-10 h-10 mb-2 opacity-60" />
                    <div className="text-sm">Upload Image</div>
                  </div>
                )}
              </label>

              <input
                id="featured"
                type="file"
                accept="image/*"
                {...register("featured")}
                className="mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Short Description
              </label>
              <textarea
                {...register("shortDescription")}
                placeholder="Write a short description...."
                className="w-full h-36 border rounded px-3 py-2 resize-none"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              {...register("content")}
              placeholder="Enter The Title Of The Blog"
              className="w-full h-40 border rounded px-3 py-2 resize-none"
            />
          </div>

          {/* Tags + Author Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                {...register("tags")}
                placeholder="Beach, Adventure, Bali"
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-400 mt-1">Comma separated tags</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Author Name
              </label>
              <input
                {...register("author")}
                placeholder="Name"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* bottom - optional Save Draft button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                reset();
                setPreview(null);
              }}
              className="mr-3 px-4 py-2 border rounded"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
