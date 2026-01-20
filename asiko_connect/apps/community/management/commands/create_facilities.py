# -*- coding: utf-8 -*-
"""
Management command pour créer des données de test pour les établissements de santé.
Usage: python manage.py create_facilities
"""

from django.core.management.base import BaseCommand
from asiko_connect.apps.community.models import HealthFacility


class Command(BaseCommand):
    help = 'Crée des données de test pour les établissements de santé d\'Abidjan'

    def handle(self, *args, **options):
        facilities_data = [
            # Hôpitaux Généraux
            {
                'name': 'CHU de Treichville',
                'facility_type': 'HOSPITAL',
                'address': 'Boulevard de Marseille, Treichville, Abidjan',
                'latitude': 5.2833,
                'longitude': -3.9833,
                'phone': '+225 21 24 10 00',
                'opening_hours': 'Urgences 24h/24',
                'has_emergency': True,
                'has_pneumology': True,
            },
            {
                'name': 'CHU de Cocody',
                'facility_type': 'HOSPITAL',
                'address': 'Boulevard de France, Cocody, Abidjan',
                'latitude': 5.3600,
                'longitude': -3.9800,
                'phone': '+225 22 44 13 00',
                'opening_hours': 'Urgences 24h/24',
                'has_emergency': True,
                'has_pneumology': True,
            },
            {
                'name': 'CHU de Yopougon',
                'facility_type': 'HOSPITAL',
                'address': 'Yopougon Attié, Abidjan',
                'latitude': 5.3333,
                'longitude': -4.0833,
                'phone': '+225 23 50 70 00',
                'opening_hours': 'Urgences 24h/24',
                'has_emergency': True,
                'has_pneumology': False,
            },
            {
                'name': 'Hôpital Général d\'Abobo',
                'facility_type': 'HOSPITAL',
                'address': 'Abobo, Abidjan',
                'latitude': 5.4167,
                'longitude': -4.0167,
                'phone': '+225 23 51 00 00',
                'opening_hours': 'Urgences 24h/24',
                'has_emergency': True,
                'has_pneumology': False,
            },
            
            # Centres de Pneumologie
            {
                'name': 'Centre Anti-Tuberculose de Treichville',
                'facility_type': 'PNEUMOLOGY_CENTER',
                'address': 'Rue du Commerce, Treichville, Abidjan',
                'latitude': 5.2900,
                'longitude': -3.9900,
                'phone': '+225 21 24 56 78',
                'opening_hours': 'Lun-Ven: 8h-17h, Sam: 8h-12h',
                'has_emergency': False,
                'has_pneumology': True,
            },
            {
                'name': 'Centre de Pneumologie d\'Adjamé',
                'facility_type': 'PNEUMOLOGY_CENTER',
                'address': 'Adjamé, Abidjan',
                'latitude': 5.3500,
                'longitude': -4.0200,
                'phone': '+225 20 22 33 44',
                'opening_hours': 'Lun-Ven: 8h-17h',
                'has_emergency': False,
                'has_pneumology': True,
            },
            
            # Cliniques
            {
                'name': 'Polyclinique Internationale Sainte Anne-Marie (PISAM)',
                'facility_type': 'CLINIC',
                'address': 'Cocody, Abidjan',
                'latitude': 5.3650,
                'longitude': -3.9750,
                'phone': '+225 22 52 50 00',
                'opening_hours': 'Urgences 24h/24',
                'has_emergency': True,
                'has_pneumology': True,
            },
            {
                'name': 'Clinique Farah',
                'facility_type': 'CLINIC',
                'address': 'Marcory, Abidjan',
                'latitude': 5.2700,
                'longitude': -3.9700,
                'phone': '+225 21 35 60 00',
                'opening_hours': 'Lun-Sam: 8h-20h',
                'has_emergency': False,
                'has_pneumology': False,
            },
            
            # Centres de Santé
            {
                'name': 'Centre de Santé Urbain de Koumassi',
                'facility_type': 'HEALTH_CENTER',
                'address': 'Koumassi, Abidjan',
                'latitude': 5.2900,
                'longitude': -3.9500,
                'phone': '+225 21 36 70 00',
                'opening_hours': 'Lun-Ven: 7h30-17h',
                'has_emergency': False,
                'has_pneumology': False,
            },
            {
                'name': 'Centre de Santé de Port-Bouët',
                'facility_type': 'HEALTH_CENTER',
                'address': 'Port-Bouët, Abidjan',
                'latitude': 5.2500,
                'longitude': -3.9200,
                'phone': '+225 21 27 80 00',
                'opening_hours': 'Lun-Ven: 7h30-17h',
                'has_emergency': False,
                'has_pneumology': False,
            },
        ]

        created_count = 0
        for data in facilities_data:
            facility, created = HealthFacility.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Créé: {facility.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️  Existe déjà: {facility.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n🎉 {created_count} établissement(s) créé(s) sur {len(facilities_data)} au total.'))
        self.stdout.write(self.style.SUCCESS(f'📊 Total dans la base: {HealthFacility.objects.count()}')) 



