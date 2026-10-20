import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  templateUrl: './admin-placeholder.html',
  styleUrls: ['./admin-placeholder.scss'],
  standalone: false
})
export class AdminPlaceholder implements OnInit {
  title = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.title = this.route.snapshot.data['title'] || 'Módulo';
  }
}
