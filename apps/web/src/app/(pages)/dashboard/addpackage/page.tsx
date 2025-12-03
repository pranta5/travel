// app/dashboard/addpackage/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { RiImageAddLine } from "react-icons/ri";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type ItineraryItem = {
  day?: string; // backend example uses "day": "Day 1"
  description: string;
};

type ActivityItem = {
  activityName: string;
  image?: File | null;
};

type CategoryPrice = {
  category: string;
  price: string; // keep as string in form, convert to number when sending
};

type FormValues = {
  title: string;
  overview: string;
  // destinations entered as comma-separated string (we'll split to array)
  destinations: string;
  // hotels?: string;
  featuredImage?: File | null;
  itinerary: ItineraryItem[];
  activities: ActivityItem[];
  categoryAndPrice: CategoryPrice[];
};

export default function AddPackageForm() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      overview: "",
      destinations: "",
      // hotels: "",
      featuredImage: undefined,
      itinerary: [{ day: "Day 1", description: "" }],
      activities: [{ activityName: "", image: undefined }],
      categoryAndPrice: [{ category: "standard", price: "" }],
    },
  });

  // Itinerary array
  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray({
    control,
    name: "itinerary",
  });

  // Activities array
  const {
    fields: activityFields,
    append: appendActivity,
    remove: removeActivity,
  } = useFieldArray({
    control,
    name: "activities",
  });

  // Category+Price array
  const {
    fields: catPriceFields,
    append: appendCatPrice,
    remove: removeCatPrice,
  } = useFieldArray({
    control,
    name: "categoryAndPrice",
  });

  // watch files & arrays
  const featuredFile = watch("featuredImage");
  const activities = watch("activities");
  const categoryAndPrice = watch("categoryAndPrice");

  // Previews
  const featuredPreview = useMemo(() => {
    if (!featuredFile) return null;
    return typeof featuredFile === "object" && "name" in (featuredFile as File)
      ? URL.createObjectURL(featuredFile as File)
      : null;
  }, [featuredFile]);

  const [activityPreviews, setActivityPreviews] = useState<(string | null)[]>(
    () => activityFields.map(() => null)
  );

  // keep activityPreviews length in sync
  useEffect(() => {
    setActivityPreviews((prev) => {
      const next = [...prev];
      if (activityFields.length > next.length) {
        return [
          ...next,
          ...new Array(activityFields.length - next.length).fill(null),
        ];
      }
      if (activityFields.length < next.length) {
        const removed = next.splice(activityFields.length);
        removed.forEach((u) => u && URL.revokeObjectURL(u));
        return next;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityFields.length]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (featuredPreview) URL.revokeObjectURL(featuredPreview);
      activityPreviews.forEach((u) => u && URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // featured file change
  function handleFeaturedFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setValue("featuredImage", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  // activity file change
  function handleActivityFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const file = e.target.files?.[0] ?? null;
    const fieldName = `activities.${index}.image` as const;

    // revoke previous preview if exists
    setActivityPreviews((prev) => {
      const copy = [...prev];
      const prevUrl = copy[index];
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      copy[index] = file ? URL.createObjectURL(file) : null;
      return copy;
    });

    setValue(fieldName, file, { shouldDirty: true, shouldValidate: true });
  }

  // Submit
  const onSubmit = async (data: FormValues) => {
    try {
      // Build FormData
      const formData = new FormData();

      // Basic fields
      formData.append("title", data.title);
      formData.append("overview", data.overview || "");
      // destination: send as JSON array
      const destArray = data.destinations
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      formData.append("destination", JSON.stringify(destArray));
      // formData.append("hotel", data.hotels || "");

      // categoryAndPrice -> convert prices to numbers
      const catPricePayload = (data.categoryAndPrice || []).map((cp) => ({
        category: cp.category,
        price: Number(cp.price || 0),
      }));
      formData.append("categoryAndPrice", JSON.stringify(catPricePayload));

      // itinerary as-is (array of {day, description})
      formData.append("itinerary", JSON.stringify(data.itinerary || []));

      // featured image file
      if (data.featuredImage) {
        formData.append("featuredImage", data.featuredImage);
      }

      const activitiesMeta: { activityName: string }[] = [];

      (data.activities || []).forEach((a) => {
        activitiesMeta.push({ activityName: a.activityName });

        if (a.image) {
          formData.append("activityImages", a.image); // SAME FIELD NAME
        }
      });

      formData.append("activity", JSON.stringify(activitiesMeta));

      // Debug log - remove in production
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }

      // POST request
      const res = await api.post("/packages/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.success) {
        toast.success(res.data.message || "Package created");
        // optional: navigate to package list or view created package
        // If API returns created package ID, navigate to edit or view
        const created = res.data.data;
        // if (created?._id) {
        //   router.push(`/dashboard/packages/${created._id}`);
        //   return;
        // }
        // fallback: reset form
        reset();
      } else {
        toast.error(res?.data?.message || "Failed to create package");
      }
    } catch (err: any) {
      // axios interceptor may show toast, but handle here too
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create package";
      toast.error(message);
      console.error(err);
    }
  };

  return (
    <div className="pb-20 text-gray-600">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Add Packages</h1>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 md:mt-0 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-60"
          >
            {isSubmitting ? "Publishing..." : "Publish Package"}
          </button>
        </div>

        {/* Grid Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Package Title */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Package Title
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              type="text"
              placeholder="Enter The Title Of The Package"
              className="w-full border rounded-lg px-4 py-2"
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1">
                {String(errors.title.message)}
              </p>
            )}
          </div>

          {/* Category & Price (field array) */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Category & Price
            </label>
            <div className="space-y-2">
              {catPriceFields.map((f, idx) => (
                <div key={f.id} className="flex gap-2 items-center">
                  <select
                    {...register(`categoryAndPrice.${idx}.category` as const, {
                      required: true,
                    })}
                    className="flex-1 border rounded-lg px-3 py-2"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="superdeluxe">Super Deluxe</option>
                  </select>

                  <input
                    {...register(`categoryAndPrice.${idx}.price` as const, {
                      required: "Price required",
                    })}
                    placeholder="Price"
                    className="w-32 border rounded-lg px-3 py-2"
                    inputMode="numeric"
                  />

                  <button
                    type="button"
                    onClick={() => removeCatPrice(idx)}
                    className="px-3 py-2 bg-rose-100 text-rose-700 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div>
                <button
                  type="button"
                  onClick={() =>
                    appendCatPrice({ category: "standard", price: "" })
                  }
                  className="px-3 py-2 bg-teal-600 text-white rounded-lg"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Featured Image
            </label>

            <label
              className="border rounded-lg h-40 flex flex-col items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative"
              htmlFor="featured-upload"
            >
              <input
                id="featured-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFeaturedFileChange}
              />

              {featuredPreview ? (
                <img
                  src={featuredPreview}
                  alt="featured preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <RiImageAddLine className="w-10 h-10 mb-2 opacity-70" />
                  <div className="text-sm">Upload Featured Image</div>
                </div>
              )}
            </label>

            <p className="text-xs text-gray-500 mt-2">
              Click the box to upload a featured image
            </p>
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-semibold mb-2">Overview</label>
            <textarea
              {...register("overview")}
              placeholder="Write a short description...."
              rows={6}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* Price placeholder removed (now per-category) and Destination */}
          <div className="grid grid-cols-1 gap-6 ">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Destinations (comma separated)
              </label>
              <input
                {...register("destinations")}
                type="text"
                placeholder="Manali, Kasol, Tosh"
                className="w-full border rounded-lg px-4 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple destinations with commas.
              </p>
            </div>
            {/* 
            <div>
              <label className="block text-sm font-semibold mb-1">Hotels</label>
              <select
                {...register("hotels")}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Choose Hotels</option>
                <option value="hotel-a">Hotel A</option>
                <option value="hotel-b">Hotel B</option>
              </select>
            </div> */}
          </div>
        </div>

        {/* Itinerary + Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Itinerary */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Itinerary</h2>
            </div>

            <div className="space-y-4">
              {itineraryFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 border rounded-lg p-3 gap-3"
                >
                  <div>
                    <input
                      {...register(`itinerary.${index}.day` as const, {
                        required: true,
                      })}
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder={`Day ${index + 1}: Title ...`}
                    />
                  </div>

                  <div>
                    <input
                      {...register(`itinerary.${index}.description` as const)}
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="Description ..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => removeItinerary(index)}
                      className="px-3 py-2 bg-rose-100 text-rose-700 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  appendItinerary({
                    day: `Day ${itineraryFields.length + 1}`,
                    description: "",
                  })
                }
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Days
              </button>
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Activity</h2>
            </div>

            <div className="space-y-4">
              {activityFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 items-start border rounded-lg p-3"
                >
                  <div>
                    <input
                      {...register(
                        `activities.${index}.activityName` as const,
                        { required: "Activity name required" }
                      )}
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="Name"
                    />
                    {errors.activities?.[index]?.activityName && (
                      <p className="text-xs text-rose-600 mt-1">
                        {String(
                          errors.activities?.[index]?.activityName?.message
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 mt-1">
                      Upload Image
                    </label>
                    <div className="flex gap-3 items-center">
                      <label
                        className="border rounded-lg h-28 w-full flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative"
                        htmlFor={`activity-upload-${index}`}
                      >
                        <input
                          id={`activity-upload-${index}`}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleActivityFileChange(e, index)}
                        />

                        {activityPreviews?.[index] ? (
                          <img
                            src={activityPreviews[index] as string}
                            alt={`activity-${index}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <RiImageAddLine className="w-8 h-8 mb-1 opacity-70" />
                            <div className="text-sm">Upload Image</div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = activityPreviews[index];
                        if (url) URL.revokeObjectURL(url);
                        removeActivity(index);
                      }}
                      className="px-3 py-2 bg-rose-100 text-rose-700 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  appendActivity({ activityName: "", image: undefined })
                }
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
