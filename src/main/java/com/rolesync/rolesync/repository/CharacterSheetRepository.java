package com.rolesync.rolesync.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import com.rolesync.rolesync.model.CharacterSheet;

@Repository
public interface CharacterSheetRepository extends JpaRepository<CharacterSheet, Long>, QuerydslPredicateExecutor<CharacterSheet>{

}
