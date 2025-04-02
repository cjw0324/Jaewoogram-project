package com.example.demo.domain.basic.repository;

import com.example.demo.domain.basic.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {

}
