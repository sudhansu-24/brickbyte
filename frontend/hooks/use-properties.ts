import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProperties, getPropertyById, Property } from '@/lib/properties';

export const useProperties = () => {
  const queryClient = useQueryClient();
  const query = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  const mutate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  return {
    ...query,
    mutate
  };
};

export const useProperty = (id: string) => {
  return useQuery<Property>({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id),
    enabled: !!id,
  });
}; 