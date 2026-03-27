import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Blog } from "@/types/blog";



interface AddBlogFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  existingBlog?: Blog | null;
}

// ✅ Custom toolbar setup
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic"],
    ["code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
  ],
};

const quillFormats = ["header", "bold", "italic", "code-block", "list"];

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image?: File;
}

const AddBlogForm: React.FC<AddBlogFormProps> = ({
  onSubmit,
  onCancel,
  existingBlog,
}) => {
 const {
  register,
  handleSubmit,
  setValue,
  watch,
  reset,
  formState: { errors, isSubmitting },
} = useForm<BlogFormData>({
  defaultValues: {
    title: existingBlog?.title || "",
    excerpt: existingBlog?.excerpt || "",
    content: existingBlog?.content || "",
    author: existingBlog?.author || "",
    date:
      existingBlog?.date ||
      new Date().toISOString().split("T")[0],
    // ✅ Handle both array or string
    category: Array.isArray(existingBlog?.category)
      ? existingBlog.category[0]
      : existingBlog?.category || "",
  },
});

  const [preview, setPreview] = useState<string | null>(
    existingBlog?.image || null
  );

 useEffect(() => {
  if (existingBlog) {
    reset({
      title: existingBlog.title,
      excerpt: existingBlog.excerpt,
      content: existingBlog.content,
      author: existingBlog.author,
      date: existingBlog.date?.split("T")[0],
      // ✅ Convert array to string for Select
      category: Array.isArray(existingBlog.category)
        ? existingBlog.category[0]
        : existingBlog.category || "",
    });
    setPreview(existingBlog.image || null);
  }
}, [existingBlog, reset]);


  const onFormSubmit = async (data: BlogFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("excerpt", data.excerpt);
    formData.append("content", data.content);
    formData.append("author", data.author);
    formData.append("date", data.date);
   formData.append("category", JSON.stringify([data.category]));


    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    await onSubmit(formData);
  };

  const category = watch("category");

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Blog Title *</Label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="Enter blog title..."
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Author */}
      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          {...register("author", { required: "Author is required" })}
          placeholder="Enter author name..."
          className={errors.author ? "border-destructive" : ""}
        />
        {errors.author && (
          <p className="text-sm text-destructive">{errors.author.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={category}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger
            className={errors.category ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent  className="bg-background text-foreground">
            <SelectItem className="data-[highlighted]:bg-foreground" value="Fashion">Fashion</SelectItem>
            <SelectItem className="data-[highlighted]:bg-foreground" value="Lifestyle">Lifestyle</SelectItem>
            <SelectItem className="data-[highlighted]:bg-foreground" value="Beauty">Beauty</SelectItem>
            <SelectItem className="data-[highlighted]:bg-foreground" value="Trends">Trends</SelectItem>
            <SelectItem className="data-[highlighted]:bg-foreground" value="Shopping">Shopping</SelectItem>
            <SelectItem className="data-[highlighted]:bg-foreground" value="Style Tips">Style Tips</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="hidden"
          {...register("category", { required: "Category is required" })}
        />
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Publication Date *</Label>
        <Input
          id="date"
          type="date"
          {...register("date", { required: "Date is required" })}
          className={errors.date ? "border-destructive" : ""}
        />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      {/* Image File Upload */}
      <div className="space-y-2">
        <Label htmlFor="image">Featured Image *</Label>
        <Input
          id="image"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setValue("image", file);
              setPreview(URL.createObjectURL(file));
            }
          }}
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 h-32 rounded-lg object-cover"
          />
        )}
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea
          id="excerpt"
          {...register("excerpt", {
            required: "Excerpt is required",
            maxLength: {
              value: 200,
              message: "Excerpt must be less than 200 characters",
            },
          })}
          placeholder="Write a brief excerpt (max 200 characters)..."
          rows={3}
          className={errors.excerpt ? "border-destructive" : ""}
        />
        {errors.excerpt && (
          <p className="text-sm text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Blog Content *</Label>
        <ReactQuill
          theme="snow"
          value={watch("content") || ""}
          onChange={(value) => setValue("content", value, { shouldValidate: true })}
          modules={quillModules}
          formats={quillFormats}
          className={`rounded-md ${
            errors.content ? "border border-destructive" : ""
          }`}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 sm:flex-none bg-foreground text-background hover:bg-foreground"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
           className="flex-1 sm:flex-none bg-foreground text-background hover:bg-foreground"
        >
          {isSubmitting
            ? existingBlog
              ? "Updating..."
              : "Publishing..."
            : existingBlog
            ? "Update Blog"
            : "Publish Blog"}
        </Button>
      </div>
    </form>
  );
};

export default AddBlogForm;
