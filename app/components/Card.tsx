"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

interface Institution {
    id: number; 
    name: string;
    address: string;
    keyNumber: string;
    macAddresses: { name: string; mac: string; }[];
    image: string;
  }
  

const InstitutionCard: React.FC<{ institution: Institution }> = ({ institution }) => {
  const router =  useRouter();

  const handleCardClick = (id: number) => {
    router.push(`/pages/institution/${id}`);  // Adjust the path as needed
  };
  return (
    <Card sx={{ width: '300px', mx: '15%', cursor: 'pointer' }} onClick={() => handleCardClick(institution.id)}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* First Column: Image */}
          <Box sx={{ mr: 2 }}>
            <img
              src={institution.image}
              alt={institution.name}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          </Box>

          {/* Second Column: Name */}
          <Box>
            <Typography variant="h6" align="center">
              {institution.name}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'right', p: 1 }}>
        <IconButton onClick={(e) => e.stopPropagation()}>
          <Edit />
        </IconButton>
        <IconButton color="error" onClick={(e) => e.stopPropagation()}>
          <Delete />
        </IconButton>
      </Box>
    </Card>
  );
};

export default InstitutionCard;