import React, { useState, ChangeEvent, FormEvent } from 'react';

interface Response {
  rating: number;
  description: string;
}

const Home: React.FC = () => {
  const [rating, setRating] = useState<number>(1.0);
  const [description, setDescription] = useState<string>('');
  const [responses, setResponses] = useState<Response[]>([]);

  const handleRatingChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRating(parseFloat(event.target.value));
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setResponses([...responses, { rating, description }]);
    setDescription('');
  };

  return (
    <div>
      <h1>CheckNin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="rating">Rate your day (1-10): </label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={rating}
            onChange={handleRatingChange}
            min="1"
            step="0.1"
            max="10"
            style={{color:'black'}}
          />
        </div>
        <div>
          <label htmlFor="description">Describe your day:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            rows={5}
            cols={40}
            style={{ resize: 'both', color: 'black'}}
          ></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
      <div>
        <h2>User Responses:</h2>
        {responses.map((response, index) => (
          <div key={index} style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
            <p>
              <strong>Rating:</strong> {response.rating}
            </p>
            <p>
              <strong>Description:</strong> {response.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;