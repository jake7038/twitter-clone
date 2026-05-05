import { useState } from 'react';
import api from '../api/axios';

export default function FollowButton({ username, initialFollowing, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { data } = await api.post(`/users/${username}/follow/`);
      setFollowing(data.following);
      if (onToggle) onToggle(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={following ? 'btn btn-outline' : 'btn btn-primary'}
    >
      {following ? 'Seguindo' : 'Seguir'}
    </button>
  );
}