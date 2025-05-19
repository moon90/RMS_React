import { useState } from 'react';

export default function UserAdd() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    about: '',
    status: 'active',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      about: '',
      status: 'active',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted User:', form, imageFile);
  };

  return (
    <div className="bg-white p-8 w-full rounded-md border border-purple-100 shadow-sm">
      <h2 className="text-2xl font-bold text-purple-700 mb-2">Add User</h2>
      <p className="text-sm text-gray-500 mb-6">This section is for store-level user registration.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full border border-purple-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full border border-purple-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-purple-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-purple-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            rows={3}
            className="w-full border border-purple-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="w-24 h-24 border border-purple-200 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 text-sm">60x60</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-purple-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="active"
                checked={form.status === 'active'}
                onChange={handleChange}
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={form.status === 'inactive'}
                onChange={handleChange}
              />
              Inactive
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="bg-purple-100 text-purple-700 px-5 py-2 rounded hover:bg-purple-200 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
