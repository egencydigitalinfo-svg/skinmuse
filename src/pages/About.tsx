const About = () => {
  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-4xl">
        <h1 className="text-4xl text-secondary font-bold font-serif mb-8">About SKIN MUSE</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-secondary">
          <p>
            SKIN MUSE is a luxury beauty brand dedicated to helping you discover products
            perfectly tailored to your unique skin type. We believe that everyone deserves
            skincare and makeup that works with their skin, not against it.
          </p>

          <h2 className="text-2xl font-serif text-secondary font-bold mt-8 mb-4">Our Philosophy</h2>
          <p>
            We curate premium products from the finest brands, organizing them by skin type
            to make your shopping experience effortless. Whether you have dry, oily,
            combination, or acne-prone skin, we have the perfect solution for you.
          </p>

          <h2 className="text-2xl font-serif text-secondary font-bold mt-8 mb-4">Product Categories</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>SM skincare:</strong> Premium skincare products for every skin type</li>
            <li><strong>SM makeup:</strong> High-quality makeup that complements your skin</li>
          </ul>

          <h2 className="text-2xl font-serif text-secondary font-bold mt-8 mb-4">Skin Types We Serve</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-secondary font-bold mb-2">Dry Skin</h3>
              <p>Hydrating and nourishing products to restore moisture balance</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-secondary font-bold mb-2">Oily Skin</h3>
              <p>Oil-control formulas that mattify without stripping</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-secondary font-bold mb-2">Combination Skin</h3>
              <p>Balanced products that address multiple concerns</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-secondary font-bold mb-2">Acne-Prone Skin</h3>
              <p>Gentle, effective treatments for clear, healthy skin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
