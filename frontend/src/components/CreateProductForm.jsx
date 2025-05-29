import { useState } from "react";
import { motion } from "framer-motion";
import { PlusSquare, Upload, Loader } from "lucide-react";
import { useProductStore } from "../store/useProductStore";

const categories = ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags","watch"];

const CreateProductForm = () => {
	const { createProduct, loading } = useProductStore();

	const [newProduct, setNewProduct] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		countInStock: "",	
	});

	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState("");
	const [statusMessage, setStatusMessage] = useState("");


	const handleSubmit = async (e) => {
		e.preventDefault();

		// Basic validation
		if (parseFloat(newProduct.price) <= 0 || parseInt(newProduct.countInStock) < 0) {
			alert("Price must be greater than 0 and stock cannot be negative.");
			return;
		}

		const formData = new FormData();
		formData.append("name", newProduct.name);
		formData.append("description", newProduct.description);
		formData.append("price", parseFloat(newProduct.price));
		formData.append("category", newProduct.category);
		formData.append("countInStock", parseInt(newProduct.countInStock));

		if (imageFile) {
			formData.append("image", imageFile);
		}

		// Log form data correctly
		console.log("FormData contents:");
		for (let [key, value] of formData.entries()) {
			console.log(`${key}:`, value);
		}

		try {
			await createProduct(formData);
			setStatusMessage("✅ Product created successfully!");

			// Reset form
			setNewProduct({
				name: "",
				description: "",
				price: "",
				category: "",
				countInStock: "",
			});
			setImageFile(null);
			setImagePreview("");
		} catch (error) {
			console.error("Error creating a product:", error);
			setStatusMessage("❌ Failed to create product.");
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file);

			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<motion.div
			className='bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<h2 className='text-2xl font-semibold mb-6 text-emerald-300'>Create New Product</h2>

			{statusMessage && (
				<p className='mb-4 text-sm text-center text-emerald-400'>{statusMessage}</p>
			)}

			<form onSubmit={handleSubmit} className='space-y-4' encType="multipart/form-data">
				{/* Name */}
				<div>
					<label htmlFor='name' className='block text-sm font-medium text-gray-300'>
						Product Name
					</label>
					<input
						type='text'
						id='name'
						value={newProduct.name}
						onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
						className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500'
						required
					/>
				</div>

				{/* Description */}
				<div>
					<label htmlFor='description' className='block text-sm font-medium text-gray-300'>
						Description
					</label>
					<textarea
						id='description'
						value={newProduct.description}
						onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
						rows='3'
						className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500'
						required
					/>
				</div>

				{/* Price */}
				<div>
					<label htmlFor='price' className='block text-sm font-medium text-gray-300'>
						Price
					</label>
					<input
						type='number'
						id='price'
						value={newProduct.price}
						onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
						step='0.01'
						className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500'
						required
					/>
				</div>

				{/* Category */}
				<div>
					<label htmlFor='category' className='block text-sm font-medium text-gray-300'>
						Category
					</label>
					<select
						id='category'
						value={newProduct.category}
						onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
						className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500'
						required
					>
						<option value=''>Select a category</option>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>

				{/* Stock */}
				<div>
					<label htmlFor='countInStock' className='block text-sm font-medium text-gray-300'>
						Count In Stock
					</label>
					<input
						type='number'
						id='countInStock'
						value={newProduct.countInStock}
						onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })}
						min='0'
						className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500'
						required
					/>
				</div>

				{/* Image Upload */}
				<div className='mt-1 flex flex-col gap-2'>
					<input
						type='file'
						id='image'
						className='sr-only'
						accept='image/*'
						onChange={handleImageChange}
						required
					/>
					<label
						htmlFor='image'
						className='cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md text-sm text-gray-300 hover:bg-gray-600 focus:ring-emerald-500'
					>
						<Upload className='h-5 w-5 inline-block mr-2' />
						Upload Image
					</label>

					{imagePreview && (
						<div className="mt-2">
							<p className="text-sm text-gray-400 mb-1">Image Preview:</p>
							<img
								src={imagePreview}
								alt="Preview"
								className="h-32 w-32 object-contain border border-gray-600 rounded-md"
							/>
						</div>
					)}
				</div>

				{/* Submit */}
				<button
					type='submit'
					className='w-full flex justify-center py-2 px-4 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:opacity-50'
					disabled={loading}
				>
					{loading ? (
						<>
							<Loader className='mr-2 h-5 w-5 animate-spin' />
							Creating...
						</>
					) : (
						<>
							<PlusSquare className='mr-2 h-5 w-5' />
							Create Product
						</>
					)}
				</button>
			</form>
		</motion.div>
	);
};

export default CreateProductForm;
