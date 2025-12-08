"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { RiImageAddLine } from "react-icons/ri";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type ItineraryItem = {
  day?: string;
  description: string;
};

type ActivityItem = {
  activityName: string;
  image?: File | null;
};

type CategoryPrice = {
  category: string;
  price: string;
};

type FormValues = {
  title: string;
  overview: string;
  destinations: string;
  featuredImage?: File | null;
  itinerary: ItineraryItem[];
  activities: ActivityItem[];
  categoryAndPrice: CategoryPrice[];
  availableDates: string[];
  groupStart?: string;
  travelStart?: string;
  travelEnd?: string;
};

export default function AddPackageForm() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      overview: "",
      destinations: "",
      featuredImage: undefined,
      itinerary: [{ day: "Day 1", description: "" }],
      activities: [{ activityName: "", image: undefined }],
      categoryAndPrice: [{ category: "standard", price: "" }],
      availableDates: [],
      groupStart: "",
      travelStart: "",
      travelEnd: "",
    },
  });

  // availableDates field array
  const {
    fields: availableDateFields,
    append: appendAvailableDate,
    remove: removeAvailableDate,
  } = useFieldArray({
    control,
    name: "availableDates",
  } as any);

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
  const travelStart = watch("travelStart");
  const travelEnd = watch("travelEnd");
  const groupStart = watch("groupStart");
  const availableDates = watch("availableDates");

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

  // Add groupStart into availableDates
  function handleAddGroupStartDate() {
    const val = getValues("groupStart")?.trim();
    if (!val) {
      toast.error("Please pick a date to add");
      return;
    }
    // prevent duplicates
    const exists = (getValues("availableDates") || []).includes(val);
    if (exists) {
      toast.error("Date already added");
      return;
    }
    appendAvailableDate(val);
    // clear groupStart input
    setValue("groupStart", "");
  }

  // Submit
  const onSubmit = async (data: FormValues) => {
    try {
      // basic validation for travelStart/travelEnd if used
      if (data.travelStart && data.travelEnd) {
        const s = new Date(data.travelStart);
        const e = new Date(data.travelEnd);
        if (e < s) {
          toast.error("End date cannot be before start date");
          return;
        }
      }

      // Build FormData
      const formData = new FormData();

      // Basic fields
      formData.append("title", data.title);
      formData.append("overview", data.overview || "");
      const destArray = data.destinations
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      formData.append("destination", JSON.stringify(destArray));

      // categoryAndPrice -> convert prices to numbers
      const catPricePayload = (data.categoryAndPrice || []).map((cp) => ({
        category: cp.category,
        price: Number(cp.price || 0),
      }));
      formData.append("categoryAndPrice", JSON.stringify(catPricePayload));

      // itinerary
      formData.append("itinerary", JSON.stringify(data.itinerary || []));

      // featured image file
      if (data.featuredImage) {
        formData.append("featuredImage", data.featuredImage);
      }

      const activitiesMeta: { activityName: string }[] = [];

      (data.activities || []).forEach((a) => {
        activitiesMeta.push({ activityName: a.activityName });

        if (a.image) {
          formData.append("activityImages", a.image);
        }
      });

      formData.append("activity", JSON.stringify(activitiesMeta));

      // NEW: availableDates — send as JSON array like ["2026-01-15","2026-01-20"]
      const datesPayload = (data.availableDates || []).filter(Boolean);
      if (datesPayload.length > 0) {
        formData.append("availableDates", JSON.stringify(datesPayload));
      }

      // Optional: also send groupStart separately if needed by backend
      if (data.groupStart) {
        formData.append("groupStart", data.groupStart);
      }

      // POST request
      const res = await api.post("/packages/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.success) {
        toast.success(res.data.message || "Package created");
        reset();
      } else {
        toast.error(res?.data?.message || "Failed to create package");
      }
    } catch (err: any) {
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

          {/* Destinations + Available Dates */}
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

            {/* Group start single date + Add date button -> appends to availableDates */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Group tour starting date
              </label>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Select date</label>
                  <input
                    {...register("groupStart")}
                    type="date"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="2026-01-15"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAddGroupStartDate}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg"
                  >
                    Add date
                  </button>
                </div>
              </div>
            </div>

            {/* Available dates list (editable via remove) */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Available Dates
              </label>

              <div className="space-y-2">
                {availableDateFields.map((f, idx) => (
                  <div key={f.id} className="flex items-center gap-2">
                    {/* We render the date as an input so user can edit if needed */}
                    <input
                      {...register(`availableDates.${idx}` as const)}
                      type="date"
                      className="flex-1 border rounded-lg px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeAvailableDate(idx)}
                      className="px-3 py-2 bg-rose-100 text-rose-700 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
