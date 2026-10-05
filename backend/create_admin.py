"""
Script à exécuter une fois pour créer le premier compte administrateur.
Usage : python create_admin.py
"""
from app.database import SessionLocal
from app import models, auth

def main():
    db = SessionLocal()
    nom = input("Nom d'utilisateur admin : ").strip()
    mot_de_passe = input("Mot de passe : ").strip()

    existant = db.query(models.Utilisateur).filter(models.Utilisateur.nom == nom).first()
    if existant:
        print("Cet utilisateur existe déjà.")
        return

    admin = models.Utilisateur(
        nom=nom,
        mot_de_passe=auth.hash_password(mot_de_passe),
        role=models.RoleEnum.ADMIN,
    )
    db.add(admin)
    db.commit()
    print(f"Utilisateur admin '{nom}' créé avec succès.")

if __name__ == "__main__":
    main()
